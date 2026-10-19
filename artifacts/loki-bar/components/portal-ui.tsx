'use client'
import {useState,type ReactNode} from 'react'
export function Card({title,children}:{title:string;children:ReactNode}){return <section className="portal-card"><h2>{title}</h2>{children}</section>}
export type Field={name:string;label:string;type?:string;options?:string[];required?:boolean;maxLength?:number;value?:string}
export function TaskForm({fields,label,onSubmit}:{fields:Field[];label:string;onSubmit:(v:Record<string,string>)=>Promise<void>}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false)
 return <form onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form)) as Record<string,string>;setBusy(true);setMessage('');try{await onSubmit(data);form.reset();setMessage('Saved.');setFailed(false)}catch(error){setMessage(error instanceof Error?error.message:'Could not save. Try again.');setFailed(true)}finally{setBusy(false)}}}>
 {fields.map(f=><label key={f.name}>{f.label}{f.options?<select name={f.name} defaultValue={f.value??f.options[0]}>{f.options.map(o=><option key={o}>{o}</option>)}</select>:f.type==='textarea'?<textarea name={f.name} required={f.required!==false} maxLength={f.maxLength??2000} rows={3} defaultValue={f.value}/>:<input name={f.name} type={f.type??'text'} required={f.required!==false} maxLength={f.maxLength??200} defaultValue={f.value}/>}</label>)}
 <button className="primary" disabled={busy}>{busy?'Saving…':label}</button>{message&&<p role={failed?'alert':'status'} className={failed?'error':'success'}>{message}</p>}</form>
}
export function Action({children,run}:{children:ReactNode;run:()=>Promise<unknown>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 return <span className="action"><button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await run()}catch(e){setError(e instanceof Error?e.message:'Action failed.')}finally{setBusy(false)}}}>{busy?'Working…':children}</button>{error&&<span role="alert" className="error">{error}</span>}</span>
}
