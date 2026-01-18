import React, { useState } from 'react'
import { forgot } from '../api/api'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [resetToken, setResetToken] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState(null)

  const getQ = async ()=> {
    try {
      const data = await forgot.question({ email })
      setQuestion(data.securityQuestion)
    } catch (err) { setMsg(err.message || 'Error') }
  }

  const verify = async () => {
    try {
      const data = await forgot.verify({ email, securityAnswer: answer })
      setResetToken(data.resetToken)
      setMsg('Answer ok — set new password')
    } catch (err) { setMsg(err.message || 'Error') }
  }

  const reset = async ()=> {
    try {
      await forgot.reset({ resetToken, newPassword })
      setMsg('Password reset successful')
    } catch (err) { setMsg(err.message || 'Error') }
  }

  return (
    <div style={{maxWidth:600,margin:'0 auto'}}>
      <div className="card">
        <h3>Forgot Password</h3>
        {!question ? (
          <>
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <button onClick={getQ}>Get Security Question</button>
          </>
        ) : (
          <>
            <p><strong>{question}</strong></p>
            <input placeholder="Your Answer" value={answer} onChange={e=>setAnswer(e.target.value)} />
            <button onClick={verify}>Verify</button>
          </>
        )}
        {resetToken && <>
          <input placeholder="New password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
          <button onClick={reset}>Reset Password</button>
        </>}
        {msg && <p><small>{msg}</small></p>}
      </div>
    </div>
  )
}
