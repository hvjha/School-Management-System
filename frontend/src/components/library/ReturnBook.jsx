import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";

export default function ReturnBooksAdmin() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [issues, setIssues] = useState([]);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [paymentMode, setPaymentMode] = useState("cash");

  /* ---------------- LOAD STUDENTS ---------------- */
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const { data } = await api.get("/api/admin/user-details");
        setStudents(data?.users?.students || []);
      } catch {
        toast.error("Failed to load students");
      }
    };
    loadStudents();
  }, []);

  /* ---------------- FETCH ISSUED BOOKS ---------------- */
  const fetchIssuedBooks = async (studentId) => {
    if (!studentId) return;

    setLoading(true);
    setIssues([]);
    setSelectedIssues([]);

    try {
      const { data } = await api.get(
        `/api/library/book/issued/${studentId}`
      );

      setIssues(
        (data.issues || []).map((issue) => ({
          ...issue,
          dueDateFormatted: new Date(issue.dueDate).toLocaleDateString(),
        }))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "No issued books");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SELECT / DESELECT ---------------- */
  const toggleIssue = (issueId) => {
    setSelectedIssues((prev) =>
      prev.includes(issueId)
        ? prev.filter((id) => id !== issueId)
        : [...prev, issueId]
    );
  };

  /* ---------------- CALCULATE FINE ---------------- */
  const selectedFine = useMemo(() => {
    return issues
      .filter((i) => selectedIssues.includes(i._id))
      .reduce((sum, i) => sum + (i.fine || 0), 0);
  }, [issues, selectedIssues]);

  /* ---------------- LOAD RAZORPAY SCRIPT ---------------- */
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /* ---------------- RETURN BOOKS ---------------- */
  const returnBooks = async () => {
    if (selectedIssues.length === 0) {
      toast.error("Select at least one book to return");
      return;
    }

    if (
      !window.confirm(
        selectedFine > 0
          ? `Proceed to pay ₹${selectedFine} and return books?`
          : `Return ${selectedIssues.length} book(s)?`
      )
    )
      return;

    try {
      /* ---- FINE PAYMENT FLOW ---- */
      if (selectedFine > 0) {
        if (paymentMode === "cash") {
          await api.post("/api/fine/pay", {
            issueIds: selectedIssues,
            paymentMode,
            transactionId: null,
          });
        } else if (paymentMode === "online") {
          console.log("Loading Razorpay script...");
          const res = await loadRazorpayScript();
          if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            return;
          }
          console.log("Razorpay script loaded.");

          // 1. Create Order on Backend
          console.log("Creating Razorpay order...");
          const { data: orderData } = await api.post("/api/fine/create-order", {
            amount: selectedFine,
            issueIds: selectedIssues,
          });

          if (!orderData.success) {
            console.error("Order creation failed:", orderData);
            toast.error("Failed to create Razorpay order: " + (orderData.message || "Unknown error"));
            return;
          }
          console.log("Order created:", orderData.order);

          // 2. Mock Flow or Open Razorpay Checkout
          if (orderData.isMock) {
            toast.info("Mock Payment: Simulating success...");
            setTimeout(async () => {
              await api.post("/api/fine/verify-payment", {
                razorpay_order_id: orderData.order.id,
                razorpay_payment_id: "mock_pay_" + Date.now(),
                razorpay_signature: "mock_sig",
                issueIds: selectedIssues,
                amount: selectedFine,
              }).then(({ data: verifyData }) => {
                if (verifyData.success) {
                  proceedWithReturn();
                } else {
                  toast.error("Mock verification failed");
                }
              }).catch(() => toast.error("Mock verification error"));
            }, 1000);
            return;
          }

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID", 
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            name: "Library Fine Payment",
            description: "Fine for late book return",
            order_id: orderData.order.id,
            handler: async function (response) {
              console.log("Payment response received:", response);
              try {
                // 3. Verify Payment on Backend
                const { data: verifyData } = await api.post("/api/fine/verify-payment", {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  issueIds: selectedIssues,
                  amount: selectedFine,
                });

                if (verifyData.success) {
                  console.log("Payment verified.");
                  await proceedWithReturn();
                } else {
                  console.error("Verification failed:", verifyData);
                  toast.error("Payment verification failed");
                }
              } catch (err) {
                console.error("Error during verification API call:", err);
                toast.error("Error during payment verification");
              }
            },
            prefill: {
              name: students.find(s => s._id === selectedStudent)?.name || "",
              email: "", 
              contact: "", 
            },
            theme: {
              color: "#16a34a",
            },
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.open();
          return; 
        }
      }

      // If no fine or cash payment, proceed directly
      await proceedWithReturn();

    } catch (err) {
      toast.error(err.response?.data?.message || "Return failed");
    }
  };

  const proceedWithReturn = async () => {
    try {
      /* ---- RETURN BOOKS ---- */
      for (const issueId of selectedIssues) {
        await api.put(`/api/library/book/return/${issueId}`);
      }

      toast.success(
        selectedFine > 0
          ? "Fine paid & books returned"
          : "Books returned successfully"
      );

      setSelectedIssues([]);
      fetchIssuedBooks(selectedStudent);
    } catch (err) {
      toast.error(err.response?.data?.message || "Book return failed after payment");
    }
  };

  return (
    <div className="glass-card p-8 rounded-[2.5rem] mt-5 mb-10 border border-white/10 robust-inset shadow-2xl animate-in fade-in duration-700 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Return Assets & Fine Recovery</h2>

      {/* ---------- STUDENT SELECT ---------- */}
      <div className="mb-8">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 block mb-2">Select Personnel</label>
        <select
          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none"
          value={selectedStudent}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedStudent(id);
            fetchIssuedBooks(id);
          }}
        >
          <option value="" className="bg-slate-900">Scanning Database...</option>
          {students.map((s) => (
            <option key={s._id} value={s._id} className="bg-slate-900">
              {s.name} ({s.studentId})
            </option>
          ))}
        </select>
      </div>

      {/* ---------- ISSUED BOOKS ---------- */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-red-600"></div>
        </div>
      )}

      {!loading && issues.length > 0 && (
        <div className="border border-white/10 rounded-[2rem] p-6 max-h-[400px] overflow-y-auto no-scrollbar bg-white/5 robust-inset space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Deployed Assets</h3>
          
          {issues.map((i) => (
            <label
              key={i._id}
              className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${
                selectedIssues.includes(i._id)
                  ? "bg-red-600/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  : "bg-white/5 border-white/10 hover:border-red-500/50 hover:bg-white/10"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIssues.includes(i._id)}
                onChange={() => toggleIssue(i._id)}
                className="hidden"
              />
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedIssues.includes(i._id) ? "border-red-500 bg-red-600" : "border-slate-500"}`}>
                  {selectedIssues.includes(i._id) && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>

              <div className="flex-1">
                <p className={`font-black uppercase italic leading-tight ${selectedIssues.includes(i._id) ? "text-white" : "text-slate-300"}`}>{i.book.title}</p>
                <div className="flex flex-wrap gap-4 mt-1 text-[10px] font-bold text-slate-500">
                   <p>ISBN: <span className="text-slate-400">{i.book.isbn}</span></p>
                   <p>DUE: <span className="text-slate-400">{i.dueDateFormatted}</span></p>
                </div>
              </div>
              
              {i.fine > 0 && (
                 <div className="text-right">
                    <p className="text-[10px] uppercase font-black text-red-400 tracking-wider">Fine Penalty</p>
                    <p className="text-xl font-black text-red-500 text-shadow-red">₹{i.fine}</p>
                 </div>
              )}
            </label>
          ))}
        </div>
      )}

      {!loading && selectedStudent && issues.length === 0 && (
        <div className="text-center py-10 opacity-30 border border-white/10 rounded-3xl robust-inset bg-white/5">
          <p className="text-xl font-black text-white uppercase tracking-widest">No Active Missions</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">Personnel Clear</p>
        </div>
      )}

      {/* ---------- PAYMENT MODE ---------- */}
      {selectedFine > 0 && (
        <div className="mt-8 p-6 rounded-2xl bg-red-900/10 border border-red-500/20">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Payment Protocol</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMode === "cash" ? "border-red-500 bg-red-600" : "border-slate-500"}`}>
                   {paymentMode === "cash" && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <span className={`text-xs font-black uppercase tracking-wider ${paymentMode === "cash" ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>Cash Transaction</span>
              <input type="radio" name="paymentMode" value="cash" checked={paymentMode === "cash"} onChange={() => setPaymentMode("cash")} className="hidden"/>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMode === "online" ? "border-red-500 bg-red-600" : "border-slate-500"}`}>
                   {paymentMode === "online" && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <span className={`text-xs font-black uppercase tracking-wider ${paymentMode === "online" ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>Digital Transfer</span>
              <input type="radio" name="paymentMode" value="online" checked={paymentMode === "online"} onChange={() => setPaymentMode("online")} className="hidden"/>
            </label>
          </div>
        </div>
      )}

      {/* ---------- RETURN BUTTON ---------- */}
      {issues.length > 0 && (
        <div className="flex justify-end mt-8">
          <button
            disabled={selectedIssues.length === 0}
            onClick={returnBooks}
            className={`px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
              selectedIssues.length === 0
                ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-red-500/20"
            }`}
          >
            {selectedFine > 0
              ? `Authorize Pay ₹${selectedFine} & Return`
              : `Process Return (${selectedIssues.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
