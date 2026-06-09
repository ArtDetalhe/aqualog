import { useState } from "react";

const STORAGE_KEY_PARAMS = "aq_params";
const STORAGE_KEY_LOGS = "aq_logs";
const STORAGE_KEY_ESPECIES = "aq_especies";

function useStore(key) {
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  });
  const save = (v) => { setData(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [data, save];
}

const fmtDate = (s) => { if (!s) return ""; const [y,m,d] = s.split("-"); return `${d}/${m}/${y}`; };
const todayStr = () => new Date().toISOString().slice(0,10);
const nowTime = () => { const d = new Date(); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); };
const daysDiff = (s) => { if (!s) return null; return Math.floor((new Date() - new Date(s+"T00:00:00")) / 86400000); };

const phColor = (v) => v==null?"#5b8fa8":v>=6.5&&v<=7.5?"#00e5c0":v>=6&&v<=8?"#ffd166":"#ff6b6b";
const tempColor = (v) => v==null?"#5b8fa8":v>=24&&v<=27?"#00e5c0":v>=22&&v<=29?"#ffd166":"#ff6b6b";
const amoniaColor = (v) => v==null?"#5b8fa8":v===0?"#00e5c0":v<0.25?"#ffd166":"#ff6b6b";
const nitritoColor = (v) => v==null?"#5b8fa8":v===0?"#00e5c0":v<0.5?"#ffd166":"#ff6b6b";

const STORAGE_KEY_TANKS = "aq_tanks";
const STORAGE_KEY_NOTAS = "aq_notas";
const TIPOS = ["🔧 Manutenção","💧 Troca d'água","🌿 Plantas","🐟 Peixes/Fauna","💊 Medicamento","🔩 Equipamento","🍽️ Alimentação","📌 Outro"];
const ICONS = ["🐠","🐟","🦐","🐌","🐢","🌿","🪸","🦞"];
const TEMPS = ["Pacífico","Semi-agressivo","Agressivo","Tímido","Sociável"];

// ── Confirm Modal ──────────────────────────────────────────
function ConfirmModal({ msg, onYes, onNo }) {
  return (
    <div onClick={onNo} style={{position:"fixed",inset:0,background:"rgba(2,9,18,0.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0a2540",border:"1px solid rgba(255,107,107,0.35)",borderRadius:14,padding:"28px 24px",maxWidth:320,width:"90%",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>🗑️</div>
        <div style={{fontSize:15,color:"#cce8f4",marginBottom:24,lineHeight:1.5}}>{msg}</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={onNo} style={{padding:"9px 22px",borderRadius:100,border:"1px solid rgba(0,200,224,0.25)",background:"transparent",color:"#5b8fa8",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer"}}>Cancelar</button>
          <button onClick={onYes} style={{padding:"9px 22px",borderRadius:100,border:"1px solid rgba(255,107,107,0.4)",background:"rgba(255,107,107,0.15)",color:"#ff6b6b",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer"}}>Excluir</button>
        </div>
      </div>
    </div>
  );
}

// ── Shared UI ──────────────────────────────────────────────
function ParamBadge({ label, value, color, unit }) {
  return (
    <div style={{background:"rgba(2,15,26,0.6)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:10,padding:"10px 6px",textAlign:"center",minWidth:0}}>
      <div style={{fontSize:10,fontWeight:700,color:"#5b8fa8",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,color,lineHeight:1}}>{value??("—")}</div>
      {unit&&<div style={{fontSize:10,color:"#5b8fa8",marginTop:2}}>{unit}</div>}
    </div>
  );
}

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div onClick={(e)=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(2,9,18,0.88)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#0a2540",border:"1px solid rgba(0,200,224,0.18)",borderRadius:"14px 14px 0 0",padding:"20px 16px 40px",width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:"#00c8e0",letterSpacing:1}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#5b8fa8",fontSize:24,cursor:"pointer",lineHeight:1,padding:"2px 8px"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label&&<div style={{fontSize:11,fontWeight:700,color:"#5b8fa8",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{label}</div>}
      <input {...props} style={{width:"100%",background:"rgba(2,15,26,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:8,color:"#cce8f4",fontFamily:"inherit",fontSize:14,padding:"10px 12px",marginBottom:12,outline:"none",WebkitAppearance:"none",...props.style}}/>
    </div>
  );
}
function Textarea({ label, ...props }) {
  return (
    <div>
      {label&&<div style={{fontSize:11,fontWeight:700,color:"#5b8fa8",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{label}</div>}
      <textarea {...props} style={{width:"100%",background:"rgba(2,15,26,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:8,color:"#cce8f4",fontFamily:"inherit",fontSize:14,padding:"10px 12px",marginBottom:12,outline:"none",resize:"vertical",minHeight:70,...props.style}}/>
    </div>
  );
}
function Sel({ label, children, ...props }) {
  return (
    <div>
      {label&&<div style={{fontSize:11,fontWeight:700,color:"#5b8fa8",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{label}</div>}
      <select {...props} style={{width:"100%",background:"#0a2540",border:"1px solid rgba(0,200,224,0.18)",borderRadius:8,color:"#cce8f4",fontFamily:"inherit",fontSize:14,padding:"10px 12px",marginBottom:12,outline:"none",WebkitAppearance:"none",...props.style}}>{children}</select>
    </div>
  );
}
function Btn({ children, danger, ghost, style, ...props }) {
  return (
    <button {...props} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 20px",borderRadius:100,border:danger?"1px solid rgba(255,107,107,0.3)":ghost?"1px solid rgba(0,200,224,0.18)":"none",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",background:danger?"rgba(255,107,107,0.15)":ghost?"transparent":"linear-gradient(135deg,#00c8e0,#00e5c0)",color:danger?"#ff6b6b":ghost?"#5b8fa8":"#020f1a",...style}}>{children}</button>
  );
}

function DelBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.25)",borderRadius:8,color:"#ff6b6b",cursor:"pointer",fontSize:14,padding:"4px 8px",flexShrink:0,lineHeight:1}}>🗑</button>
  );
}

// ── Dashboard ──────────────────────────────────────────────
function Dashboard({ params, logs, especies }) {
  const last = params[0];
  const lastManut = logs.find(l=>l.tipo.includes("Manutenção")||l.tipo.includes("Troca"));
  const dias = lastManut ? daysDiff(lastManut.data) : null;
  return (
    <div>
      {dias!==null&&(
        <div style={{padding:"10px 14px",borderRadius:10,fontSize:13,fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:8,background:dias>=7?"rgba(255,209,102,0.12)":"rgba(0,229,192,0.1)",border:dias>=7?"1px solid rgba(255,209,102,0.3)":"1px solid rgba(0,229,192,0.25)",color:dias>=7?"#ffd166":"#00e5c0"}}>
          {dias>=7?`⚠️ Última manutenção há ${dias} dias — hora de agir!`:`✅ Última manutenção há ${dias} dias — tudo em dia!`}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[["🐟",especies.length,"Espécies"],["📝",logs.length,"Atividades"],["📊",params.length,"Medições"],["📅",dias??("—"),"Dias desde manut."]].map(([,n,lb])=>(
          <div key={lb} style={{background:"rgba(2,15,26,0.6)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:12,padding:14,textAlign:"center"}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:700,color:"#00c8e0",lineHeight:1,marginBottom:4}}>{n}</div>
            <div style={{fontSize:11,color:"#5b8fa8",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px"}}>{lb}</div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(10,37,64,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:14,padding:18,marginBottom:14}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:12,letterSpacing:"1.5px",color:"#00c8e0",textTransform:"uppercase",marginBottom:12}}>💧 Últimos Parâmetros</div>
        {last?(
          <>
            <div style={{fontSize:11,color:"#5b8fa8",marginBottom:10}}>{fmtDate(last.data)} {last.hora}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              <ParamBadge label="pH" value={last.ph} color={phColor(last.ph)}/>
              <ParamBadge label="GH" value={last.gh} color="#00c8e0" unit="°dH"/>
              <ParamBadge label="KH" value={last.kh} color="#00c8e0" unit="°dH"/>
              <ParamBadge label="Temp" value={last.temp} color={tempColor(last.temp)} unit="°C"/>
              <ParamBadge label="NH₃" value={last.amonia} color={amoniaColor(last.amonia)} unit="ppm"/>
              <ParamBadge label="NO₂" value={last.nitrito} color={nitritoColor(last.nitrito)} unit="ppm"/>
            </div>
            {last.obs&&<div style={{fontSize:12,color:"#5b8fa8",marginTop:10,fontStyle:"italic"}}>"{last.obs}"</div>}
          </>
        ):<div style={{textAlign:"center",color:"#5b8fa8",padding:"20px 0"}}>Nenhuma medição ainda</div>}
      </div>
      <div style={{background:"rgba(10,37,64,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:14,padding:18}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:12,letterSpacing:"1.5px",color:"#00c8e0",textTransform:"uppercase",marginBottom:12}}>📋 Atividades Recentes</div>
        {logs.length===0?<div style={{textAlign:"center",color:"#5b8fa8",padding:"20px 0"}}>Nenhuma atividade</div>:logs.slice(0,4).map(l=>(
          <div key={l.id} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(0,200,224,0.08)"}}>
            <div style={{fontSize:20,width:32,textAlign:"center",flexShrink:0}}>{l.tipo.split(" ")[0]}</div>
            <div>
              <div style={{fontSize:11,color:"#5b8fa8",marginBottom:3}}>{fmtDate(l.data)} {l.hora} · {l.tipo.replace(/^\S+\s/,"")}</div>
              <div style={{fontSize:14,color:"#cce8f4"}}>{l.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Parâmetros ─────────────────────────────────────────────
function Parametros({ params, addParam, delParam }) {
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState(null); // id to delete
  const [form, setForm] = useState({});
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const save = () => {
    if (!form.data) return;
    addParam({
      id:Date.now(), data:form.data, hora:form.hora||"",
      ph:form.ph!==""&&form.ph!==undefined?parseFloat(form.ph):null,
      gh:form.gh!==""&&form.gh!==undefined?parseFloat(form.gh):null,
      kh:form.kh!==""&&form.kh!==undefined?parseFloat(form.kh):null,
      temp:form.temp!==""&&form.temp!==undefined?parseFloat(form.temp):null,
      amonia:form.amonia!==""&&form.amonia!==undefined?parseFloat(form.amonia):null,
      nitrito:form.nitrito!==""&&form.nitrito!==undefined?parseFloat(form.nitrito):null,
      nitrato:form.nitrato!==""&&form.nitrato!==undefined?parseFloat(form.nitrato):null,
      obs:form.obs||"",
    });
    setForm({}); setShow(false);
  };

  return (
    <div>
      {confirm!==null&&<ConfirmModal msg="Excluir esta medição?" onYes={()=>{delParam(confirm);setConfirm(null);}} onNo={()=>setConfirm(null)}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <span style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#e8f9fd"}}>Parâmetros</span>
        <Btn onClick={()=>{setForm({data:todayStr(),hora:nowTime()});setShow(true);}}>+ Nova Medição</Btn>
      </div>
      {params.length===0&&<div style={{textAlign:"center",color:"#5b8fa8",padding:"40px 0"}}>💧 Nenhuma medição registrada</div>}
      {params.map(p=>(
        <div key={p.id} style={{background:"rgba(10,37,64,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,fontWeight:700,color:"#00c8e0"}}>📅 {fmtDate(p.data)} {p.hora}</span>
            <DelBtn onClick={()=>setConfirm(p.id)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            <ParamBadge label="pH" value={p.ph} color={phColor(p.ph)}/>
            <ParamBadge label="GH" value={p.gh} color="#00c8e0" unit="°dH"/>
            <ParamBadge label="KH" value={p.kh} color="#00c8e0" unit="°dH"/>
            <ParamBadge label="Temp" value={p.temp} color={tempColor(p.temp)} unit="°C"/>
            <ParamBadge label="NH₃" value={p.amonia} color={amoniaColor(p.amonia)} unit="ppm"/>
            <ParamBadge label="NO₂" value={p.nitrito} color={nitritoColor(p.nitrito)} unit="ppm"/>
          </div>
          {p.obs&&<div style={{fontSize:12,color:"#5b8fa8",marginTop:8,fontStyle:"italic"}}>"{p.obs}"</div>}
        </div>
      ))}
      <Modal show={show} onClose={()=>setShow(false)} title="💧 Nova Medição">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Input label="Data" type="date" value={form.data||""} onChange={f("data")}/><Input label="Hora" type="time" value={form.hora||""} onChange={f("hora")}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <Input label="pH" type="number" step="0.1" placeholder="7.0" value={form.ph||""} onChange={f("ph")}/>
          <Input label="GH °dH" type="number" step="0.5" placeholder="8" value={form.gh||""} onChange={f("gh")}/>
          <Input label="KH °dH" type="number" step="0.5" placeholder="4" value={form.kh||""} onChange={f("kh")}/>
          <Input label="Temp °C" type="number" step="0.1" placeholder="26" value={form.temp||""} onChange={f("temp")}/>
          <Input label="Amônia" type="number" step="0.05" placeholder="0" value={form.amonia||""} onChange={f("amonia")}/>
          <Input label="Nitrito" type="number" step="0.05" placeholder="0" value={form.nitrito||""} onChange={f("nitrito")}/>
        </div>
        <Input label="Nitrato ppm (opcional)" type="number" step="1" placeholder="0" value={form.nitrato||""} onChange={f("nitrato")}/>
        <Textarea label="Observações" placeholder="Água clara, peixes ativos..." value={form.obs||""} onChange={f("obs")}/>
        <Btn onClick={save} style={{width:"100%"}}>💾 Salvar Medição</Btn>
      </Modal>
    </div>
  );
}

// ── Atividades ─────────────────────────────────────────────
function Atividades({ logs, addLog, delLog }) {
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({tipo:TIPOS[0]});
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const save = () => {
    if (!form.desc?.trim()) return;
    addLog({id:Date.now(),data:form.data||todayStr(),hora:form.hora||nowTime(),tipo:form.tipo||TIPOS[0],desc:form.desc});
    setForm({tipo:TIPOS[0]}); setShow(false);
  };

  return (
    <div>
      {confirm!==null&&<ConfirmModal msg="Excluir esta atividade?" onYes={()=>{delLog(confirm);setConfirm(null);}} onNo={()=>setConfirm(null)}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <span style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#e8f9fd"}}>Atividades</span>
        <Btn onClick={()=>{setForm({data:todayStr(),hora:nowTime(),tipo:TIPOS[0]});setShow(true);}}>+ Nova</Btn>
      </div>
      {logs.length===0&&<div style={{textAlign:"center",color:"#5b8fa8",padding:"40px 0"}}>📝 Nenhuma atividade ainda</div>}
      {logs.map(l=>(
        <div key={l.id} style={{background:"rgba(10,37,64,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:12,padding:14,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:100,background:"rgba(0,200,224,0.1)",border:"1px solid rgba(0,200,224,0.25)",color:"#00c8e0"}}>{l.tipo}</span>
            <span style={{fontSize:11,color:"#5b8fa8",marginLeft:"auto"}}>{fmtDate(l.data)} {l.hora}</span>
            <DelBtn onClick={()=>setConfirm(l.id)}/>
          </div>
          <div style={{fontSize:14,color:"#cce8f4"}}>{l.desc}</div>
        </div>
      ))}
      <Modal show={show} onClose={()=>setShow(false)} title="📝 Nova Atividade">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Input label="Data" type="date" value={form.data||""} onChange={f("data")}/><Input label="Hora" type="time" value={form.hora||""} onChange={f("hora")}/></div>
        <Sel label="Tipo" value={form.tipo||""} onChange={f("tipo")}>{TIPOS.map(t=><option key={t}>{t}</option>)}</Sel>
        <Textarea label="Descrição" placeholder="O que foi feito..." value={form.desc||""} onChange={f("desc")} rows={3}/>
        <Btn onClick={save} style={{width:"100%"}}>💾 Salvar</Btn>
      </Modal>
    </div>
  );
}

// ── Espécies ───────────────────────────────────────────────
function Especies({ especies, addEspecie, delEspecie }) {
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({icon:ICONS[0],temperamento:TEMPS[0]});
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const save = () => {
    if (!form.nome?.trim()) return;
    addEspecie({id:Date.now(),nome:form.nome,sci:form.sci||"",icon:form.icon||"🐟",qtd:parseInt(form.qtd)||1,ph:form.ph||"",temp:form.temp||"",alim:form.alim||"",temperamento:form.temperamento||"",info:form.info||"",data:form.data||todayStr()});
    setForm({icon:ICONS[0],temperamento:TEMPS[0],data:todayStr()}); setShow(false);
  };

  return (
    <div>
      {confirm!==null&&<ConfirmModal msg="Excluir esta espécie?" onYes={()=>{delEspecie(confirm);setConfirm(null);}} onNo={()=>setConfirm(null)}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <span style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#e8f9fd"}}>Espécies</span>
        <Btn onClick={()=>{setForm({icon:ICONS[0],temperamento:TEMPS[0],data:todayStr()});setShow(true);}}>+ Adicionar</Btn>
      </div>
      {especies.length===0&&<div style={{textAlign:"center",color:"#5b8fa8",padding:"40px 0"}}>🐟 Nenhuma espécie cadastrada</div>}
      {especies.map(e=>(
        <div key={e.id} style={{background:"rgba(10,37,64,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:14,padding:16,marginBottom:12,display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{fontSize:28,width:48,height:48,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,200,224,0.08)",border:"1px solid rgba(0,200,224,0.18)",flexShrink:0}}>{e.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:4}}>
              <div style={{flex:1}}>
                <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:600,color:"#e8f9fd"}}>{e.nome}</span>
                <span style={{color:"#5b8fa8",fontSize:13,marginLeft:6}}>×{e.qtd}</span>
                {e.sci&&<div style={{fontSize:12,fontStyle:"italic",color:"#5b8fa8"}}>{e.sci}</div>}
              </div>
              <DelBtn onClick={()=>setConfirm(e.id)}/>
            </div>
            {e.info&&<div style={{fontSize:13,color:"#cce8f4",lineHeight:1.5,marginBottom:6}}>{e.info}</div>}
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {e.ph&&<span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:100,border:"1px solid rgba(0,200,224,0.4)",background:"rgba(0,200,224,0.08)",color:"#00c8e0"}}>pH {e.ph}</span>}
              {e.temp&&<span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:100,border:"1px solid rgba(0,229,192,0.4)",background:"rgba(0,229,192,0.08)",color:"#00e5c0"}}>🌡 {e.temp}°C</span>}
              {e.temperamento&&<span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:100,border:"1px solid rgba(255,209,102,0.4)",background:"rgba(255,209,102,0.08)",color:"#ffd166"}}>{e.temperamento}</span>}
              {e.alim&&<span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:100,border:"1px solid rgba(255,107,107,0.4)",background:"rgba(255,107,107,0.08)",color:"#ff6b6b"}}>🍽 {e.alim}</span>}
              {e.tamanho&&<span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:100,border:"1px solid rgba(180,130,255,0.4)",background:"rgba(180,130,255,0.08)",color:"#b482ff"}}>📏 até {e.tamanho}cm{e.tamanhoAtual?" · atual "+e.tamanhoAtual+"cm":""}</span>}
              {e.data&&<span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:100,border:"1px solid rgba(0,200,224,0.18)",color:"#5b8fa8"}}>Desde {fmtDate(e.data)}</span>}
            </div>
          </div>
        </div>
      ))}
      <Modal show={show} onClose={()=>setShow(false)} title="🐟 Nova Espécie">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Nome popular" placeholder="Néon tetra" value={form.nome||""} onChange={f("nome")}/>
          <Input label="Nome científico" placeholder="P. innesi" value={form.sci||""} onChange={f("sci")}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Sel label="Ícone" value={form.icon||""} onChange={f("icon")}>{ICONS.map(i=><option key={i}>{i}</option>)}</Sel>
          <Input label="Quantidade" type="number" min="1" placeholder="6" value={form.qtd||""} onChange={f("qtd")}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="pH ideal" placeholder="6.5 – 7.5" value={form.ph||""} onChange={f("ph")}/>
          <Input label="Temp ideal °C" placeholder="24 – 27" value={form.temp||""} onChange={f("temp")}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Alimentação" placeholder="Ração micro..." value={form.alim||""} onChange={f("alim")}/>
          <Sel label="Temperamento" value={form.temperamento||""} onChange={f("temperamento")}>{TEMPS.map(t=><option key={t}>{t}</option>)}</Sel>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Tamanho adulto (cm)" type="number" step="0.5" placeholder="5" value={form.tamanho||""} onChange={f("tamanho")}/>
          <Input label="Tamanho atual (cm)" type="number" step="0.5" placeholder="3" value={form.tamanhoAtual||""} onChange={f("tamanhoAtual")}/>
        </div>
        <Textarea label="Informações adicionais" placeholder="Prefere cardume, fundo escuro..." value={form.info||""} onChange={f("info")}/>
        <Input label="Data de aquisição" type="date" value={form.data||""} onChange={f("data")}/>
        <Btn onClick={save} style={{width:"100%"}}>💾 Salvar Espécie</Btn>
      </Modal>
    </div>
  );
}


// ── Notas ──────────────────────────────────────────────────
function Notas({ notas, saveNotas }) {
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [editId, setEditId] = useState(null);

  const save = () => {
    if (!texto.trim()) return;
    if (editId !== null) {
      saveNotas(notas.map(n => n.id === editId ? {...n, titulo, texto, updatedAt: new Date().toISOString()} : n));
      setEditId(null);
    } else {
      saveNotas([{id: Date.now(), titulo, texto, createdAt: new Date().toISOString()}, ...notas]);
    }
    setTitulo(""); setTexto(""); setShow(false);
  };

  const startEdit = (n) => {
    setEditId(n.id); setTitulo(n.titulo); setTexto(n.texto); setShow(true);
  };

  const fmtTs = (s) => { if (!s) return ""; const d = new Date(s); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };

  return (
    <div>
      {confirm !== null && <ConfirmModal msg="Excluir esta nota?" onYes={() => { saveNotas(notas.filter(n => n.id !== confirm)); setConfirm(null); }} onNo={() => setConfirm(null)} />}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <span style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#e8f9fd"}}>Notas</span>
        <Btn onClick={() => { setEditId(null); setTitulo(""); setTexto(""); setShow(true); }}>+ Nova Nota</Btn>
      </div>
      {notas.length === 0 && (
        <div style={{textAlign:"center",color:"#5b8fa8",padding:"40px 20px"}}>
          <div style={{fontSize:36,marginBottom:10}}>📓</div>
          <div style={{fontSize:14}}>Nenhuma nota ainda</div>
          <div style={{fontSize:12,marginTop:6,lineHeight:1.5}}>Anote curiosidades, rações, novidades,{" "}<br/>dicas ou qualquer coisa do seu aquário</div>
        </div>
      )}
      {notas.map(n => (
        <div key={n.id} style={{background:"rgba(10,37,64,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:14,padding:16,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
            <div style={{flex:1}}>
              {n.titulo && <div style={{fontSize:14,fontWeight:700,color:"#e8f9fd",marginBottom:3}}>{n.titulo}</div>}
              <div style={{fontSize:11,color:"#5b8fa8"}}>{fmtTs(n.updatedAt || n.createdAt)}{n.updatedAt ? " (editado)" : ""}</div>
            </div>
            <button onClick={() => startEdit(n)} style={{background:"rgba(0,200,224,0.1)",border:"1px solid rgba(0,200,224,0.25)",borderRadius:8,color:"#00c8e0",cursor:"pointer",fontSize:14,padding:"4px 8px",flexShrink:0}}>✏️</button>
            <DelBtn onClick={() => setConfirm(n.id)} />
          </div>
          <div style={{fontSize:14,color:"#cce8f4",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{n.texto}</div>
        </div>
      ))}
      <Modal show={show} onClose={() => setShow(false)} title={editId !== null ? "✏️ Editar Nota" : "📓 Nova Nota"}>
        <Input label="Título (opcional)" placeholder="Ex: Ração, Curiosidade, Novidade..." value={titulo} onChange={e => setTitulo(e.target.value)} />
        <Textarea label="Texto livre" placeholder="Escreva o que quiser aqui..." value={texto} onChange={e => setTexto(e.target.value)} style={{minHeight:180}} />
        <Btn onClick={save} style={{width:"100%"}}>💾 Salvar Nota</Btn>
      </Modal>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────

// ── Aquário ────────────────────────────────────────────────
const TANK_DEFS = [
  { key:"principal", label:"Aquário Principal", icon:"🐠", color:"#00c8e0" },
  { key:"sump",      label:"Sump",              icon:"⚙️", color:"#00e5c0" },
  { key:"hospital",  label:"Aquário Hospital",  icon:"🏥", color:"#ffd166" },
];

const volLitros = (c,l,a,p=100) => {
  const v = (parseFloat(c)||0)*(parseFloat(l)||0)*(parseFloat(a)||0)*(parseFloat(p)/100)/1000;
  return v > 0 ? v.toFixed(1) : null;
};

function TankCard({ def, data, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(data || {});
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const vol = volLitros(form.comp, form.larg, form.alt, form.ocupacao||100);
  const hasData = data && (data.comp || data.larg || data.alt);

  const save = () => { onSave(form); setEditing(false); };

  const fldSt = {width:"100%",background:"rgba(2,15,26,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:8,color:"#cce8f4",fontFamily:"inherit",fontSize:14,padding:"9px 10px",marginBottom:10,outline:"none",WebkitAppearance:"none"};
  const lblSt = {fontSize:11,fontWeight:700,color:"#5b8fa8",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4,display:"block"};

  return (
    <div style={{background:"rgba(10,37,64,0.7)",border:"1px solid rgba(0,200,224,0.18)",borderRadius:14,padding:18,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,background:"rgba(0,200,224,0.1)",border:`1px solid ${def.color}60`}}>{def.icon}</div>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:"#e8f9fd"}}>{def.label}</div>
            {vol&&!editing&&<div style={{fontSize:11,color:def.color,fontWeight:700,marginTop:1}}>~{vol} L</div>}
          </div>
        </div>
        <button onClick={()=>{setForm(data||{});setEditing(e=>!e);}} style={{padding:"6px 14px",borderRadius:100,border:`1px solid ${def.color}55`,background:`${def.color}18`,color:def.color,fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {editing?"✕ Cancelar":hasData?"✏️ Editar":"+ Configurar"}
        </button>
      </div>

      {!editing&&hasData&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
            {[["Comprimento",data.comp,"cm"],["Largura",data.larg,"cm"],["Altura",data.alt,"cm"]].map(([lb,val,un])=>(
              <div key={lb} style={{background:"rgba(2,15,26,0.6)",border:"1px solid rgba(0,200,224,0.14)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#5b8fa8",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:4}}>{lb}</div>
                <div style={{fontSize:18,fontWeight:700,color:def.color,lineHeight:1}}>{val||"—"}</div>
                <div style={{fontSize:10,color:"#5b8fa8",marginTop:2}}>{un}</div>
              </div>
            ))}
          </div>
          {(data.substrato||data.filtragem||data.iluminacao||data.ocupacao||data.obs)&&(
            <div style={{background:"rgba(2,15,26,0.4)",borderRadius:10,padding:"10px 12px",fontSize:13,color:"#cce8f4",lineHeight:1.8}}>
              {data.ocupacao&&data.ocupacao!=="100"&&<div><span style={{color:"#5b8fa8",fontWeight:700}}>Ocupação: </span>{data.ocupacao}% → ~{volLitros(data.comp,data.larg,data.alt,data.ocupacao)} L úteis</div>}
              {data.substrato&&<div><span style={{color:"#5b8fa8",fontWeight:700}}>Substrato: </span>{data.substrato}</div>}
              {data.filtragem&&<div><span style={{color:"#5b8fa8",fontWeight:700}}>Filtragem: </span>{data.filtragem}</div>}
              {data.iluminacao&&<div><span style={{color:"#5b8fa8",fontWeight:700}}>Iluminação: </span>{data.iluminacao}</div>}
              {data.obs&&<div style={{marginTop:4,fontStyle:"italic",color:"#5b8fa8"}}>"{data.obs}"</div>}
            </div>
          )}
        </>
      )}

      {!editing&&!hasData&&(
        <div style={{textAlign:"center",color:"#5b8fa8",padding:"10px 0",fontSize:13}}>Nenhuma dimensão configurada ainda</div>
      )}

      {editing&&(
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"#5b8fa8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>📐 Dimensões (cm)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label style={lblSt}>Comprimento</label><input type="number" step="0.5" placeholder="120" value={form.comp||""} onChange={f("comp")} style={fldSt}/></div>
            <div><label style={lblSt}>Largura</label><input type="number" step="0.5" placeholder="50" value={form.larg||""} onChange={f("larg")} style={fldSt}/></div>
            <div><label style={lblSt}>Altura</label><input type="number" step="0.5" placeholder="50" value={form.alt||""} onChange={f("alt")} style={fldSt}/></div>
          </div>
          <div><label style={lblSt}>% de ocupação real (descontando rochas, substrato, etc.)</label>
            <input type="number" min="50" max="100" placeholder="80" value={form.ocupacao||""} onChange={f("ocupacao")} style={fldSt}/>
          </div>
          {vol&&<div style={{background:`${def.color}15`,border:`1px solid ${def.color}40`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,fontWeight:700,color:def.color}}>
            💧 Volume bruto: ~{volLitros(form.comp,form.larg,form.alt)} L &nbsp;·&nbsp; Volume útil (~{form.ocupacao||100}%): ~{vol} L
          </div>}
          <div style={{fontSize:11,fontWeight:700,color:"#5b8fa8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10,marginTop:4}}>⚙️ Equipamentos</div>
          <div><label style={lblSt}>Substrato</label><input type="text" placeholder="Areia fina, calcário..." value={form.substrato||""} onChange={f("substrato")} style={fldSt}/></div>
          <div><label style={lblSt}>Filtragem</label><input type="text" placeholder="Sump, canister, HOB..." value={form.filtragem||""} onChange={f("filtragem")} style={fldSt}/></div>
          <div><label style={lblSt}>Iluminação</label><input type="text" placeholder="LED 50W, T5..." value={form.iluminacao||""} onChange={f("iluminacao")} style={fldSt}/></div>
          <div><label style={lblSt}>Observações</label><textarea rows={2} placeholder="Notas gerais..." value={form.obs||""} onChange={f("obs")} style={{...fldSt,resize:"vertical",minHeight:60}}/></div>
          <button onClick={save} style={{width:"100%",padding:"11px",borderRadius:100,border:"none",background:"linear-gradient(135deg,#00c8e0,#00e5c0)",color:"#020f1a",fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:"pointer"}}>💾 Salvar</button>
        </div>
      )}
    </div>
  );
}

function Aquario({ tanks, saveTank }) {
  const totalVol = TANK_DEFS.reduce((acc,def)=>{
    const d = tanks[def.key];
    if (!d) return acc;
    const v = parseFloat(volLitros(d.comp,d.larg,d.alt,d.ocupacao||100));
    return acc+(isNaN(v)?0:v);
  },0);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <span style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#e8f9fd"}}>Meus Aquários</span>
        {totalVol>0&&<span style={{fontSize:12,fontWeight:700,color:"#00c8e0",background:"rgba(0,200,224,0.1)",border:"1px solid rgba(0,200,224,0.25)",padding:"4px 12px",borderRadius:100}}>Total ~{totalVol.toFixed(1)} L</span>}
      </div>
      {TANK_DEFS.map(def=>(
        <TankCard key={def.key} def={def} data={tanks[def.key]||null} onSave={d=>saveTank(def.key,d)}/>
      ))}
    </div>
  );
}

export default function App() {
  const [params, setParams] = useStore(STORAGE_KEY_PARAMS);
  const [logs, setLogs] = useStore(STORAGE_KEY_LOGS);
  const [especies, setEspecies] = useStore(STORAGE_KEY_ESPECIES);
  const [notas, setNotas] = useState(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_NOTAS) || '[]'); } catch { return []; } });
  const saveNotas = v => { setNotas(v); localStorage.setItem(STORAGE_KEY_NOTAS, JSON.stringify(v)); };
  const [tanks, setTanks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_TANKS) || "{}"); } catch { return {}; }
  });
  const [tab, setTab] = useState("dashboard");
  const [importMsg, setImportMsg] = useState("");

  const addParam = rec => setParams([rec,...params]);
  const delParam = id => setParams(params.filter(p=>p.id!==id));
  const addLog = rec => setLogs([rec,...logs]);
  const delLog = id => setLogs(logs.filter(l=>l.id!==id));
  const addEspecie = rec => setEspecies([rec,...especies]);
  const delEspecie = id => setEspecies(especies.filter(e=>e.id!==id));
  const saveTank = (key, data) => {
    const updated = {...tanks, [key]: data};
    setTanks(updated);
    localStorage.setItem(STORAGE_KEY_TANKS, JSON.stringify(updated));
  };

  const [backupJson, setBackupJson] = useState("");
  const [showBackup, setShowBackup] = useState(false);

  const exportData = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      params, logs, especies, tanks,
    };
    setBackupJson(JSON.stringify(payload, null, 2));
    setShowBackup(true);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.params)   { setParams(d.params);   localStorage.setItem(STORAGE_KEY_PARAMS, JSON.stringify(d.params)); }
        if (d.logs)     { setLogs(d.logs);         localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(d.logs)); }
        if (d.especies) { setEspecies(d.especies); localStorage.setItem(STORAGE_KEY_ESPECIES, JSON.stringify(d.especies)); }
        if (d.tanks)    { setTanks(d.tanks);       localStorage.setItem(STORAGE_KEY_TANKS, JSON.stringify(d.tanks)); }
        setImportMsg("✅ Backup restaurado com sucesso!");
        setTimeout(()=>setImportMsg(""),3000);
      } catch { setImportMsg("❌ Arquivo inválido."); setTimeout(()=>setImportMsg(""),3000); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const TABS = [{id:"dashboard",label:"🏠 Início"},{id:"aquario",label:"🪣 Aquários"},{id:"parametros",label:"📊 Parâmetros"},{id:"atividades",label:"📝 Atividades"},{id:"especies",label:"🐟 Espécies"},{id:"notas",label:"📓 Notas"}];

  return (
    <div style={{minHeight:"100vh",background:"#040d14",color:"#cce8f4",fontFamily:"Nunito,sans-serif",position:"relative"}}>
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 20% 50%,rgba(0,100,160,0.25) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(0,200,224,0.12) 0%,transparent 50%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:10,padding:"18px 20px 0",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:38,height:38,background:"linear-gradient(135deg,#00c8e0,#00e5c0)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 0 20px rgba(0,200,224,0.4)"}}>🐠</div>
        <span style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,background:"linear-gradient(90deg,#00c8e0,#00e5c0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:3}}>AQUALOG</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={exportData} title="Exportar backup" style={{padding:"6px 12px",borderRadius:100,border:"1px solid rgba(0,229,192,0.4)",background:"rgba(0,229,192,0.1)",color:"#00e5c0",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>⬇️ Backup</button>
          <label title="Importar backup" style={{padding:"6px 12px",borderRadius:100,border:"1px solid rgba(255,209,102,0.4)",background:"rgba(255,209,102,0.1)",color:"#ffd166",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
            ⬆️ Restaurar<input type="file" accept=".json" onChange={importData} style={{display:"none"}}/>
          </label>
        </div>
      </div>
      {importMsg&&<div style={{position:"relative",zIndex:10,margin:"0 16px 4px",padding:"8px 14px",borderRadius:10,fontSize:13,fontWeight:600,background:importMsg.startsWith("✅")?"rgba(0,229,192,0.12)":"rgba(255,107,107,0.12)",border:importMsg.startsWith("✅")?"1px solid rgba(0,229,192,0.3)":"1px solid rgba(255,107,107,0.3)",color:importMsg.startsWith("✅")?"#00e5c0":"#ff6b6b"}}>{importMsg}</div>}
      {showBackup&&(
        <div onClick={()=>setShowBackup(false)} style={{position:"fixed",inset:0,background:"rgba(2,9,18,0.92)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0a2540",border:"1px solid rgba(0,229,192,0.3)",borderRadius:14,padding:"20px 16px",width:"92%",maxWidth:560,maxHeight:"85vh",display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#00e5c0",letterSpacing:1}}>💾 Backup — Copie o texto abaixo</span>
              <button onClick={()=>setShowBackup(false)} style={{background:"none",border:"none",color:"#5b8fa8",fontSize:22,cursor:"pointer"}}>×</button>
            </div>
            <div style={{fontSize:12,color:"#5b8fa8",lineHeight:1.5}}>Selecione todo o texto, copie e salve num arquivo <strong style={{color:"#cce8f4"}}>.txt</strong> ou <strong style={{color:"#cce8f4"}}>.json</strong> no seu celular ou nuvem.</div>
            <textarea
              readOnly
              value={backupJson}
              onFocus={e=>e.target.select()}
              style={{flex:1,minHeight:260,background:"rgba(2,15,26,0.8)",border:"1px solid rgba(0,200,224,0.2)",borderRadius:10,color:"#00e5c0",fontFamily:"monospace",fontSize:11,padding:"10px",outline:"none",resize:"none",overflowY:"auto"}}
            />
            <button
              onClick={()=>{ navigator.clipboard&&navigator.clipboard.writeText(backupJson).then(()=>{ setShowBackup(false); setImportMsg("✅ Copiado! Cole num arquivo .json e salve."); setTimeout(()=>setImportMsg(""),4000); }); }}
              style={{padding:"11px",borderRadius:100,border:"none",background:"linear-gradient(135deg,#00c8e0,#00e5c0)",color:"#020f1a",fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:"pointer"}}
            >📋 Copiar tudo</button>
          </div>
        </div>
      )}
      <div style={{position:"relative",zIndex:10,display:"flex",gap:6,padding:"14px 16px",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,padding:"8px 16px",borderRadius:100,border:tab===t.id?"1px solid #00c8e0":"1px solid rgba(0,200,224,0.18)",background:tab===t.id?"linear-gradient(135deg,#1a5f8a,#0e3a5c)":"rgba(10,37,64,0.7)",color:tab===t.id?"#00c8e0":"#5b8fa8",fontFamily:"Nunito,sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",boxShadow:tab===t.id?"0 0 12px rgba(0,200,224,0.2)":"none"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{position:"relative",zIndex:10,padding:"0 16px 80px",maxWidth:680,margin:"0 auto"}}>
        {tab==="dashboard"&&<Dashboard params={params} logs={logs} especies={especies}/>}
        {tab==="parametros"&&<Parametros params={params} addParam={addParam} delParam={delParam}/>}
        {tab==="atividades"&&<Atividades logs={logs} addLog={addLog} delLog={delLog}/>}
        {tab==="aquario"&&<Aquario tanks={tanks} saveTank={saveTank}/>}
        {tab==="especies"&&<Especies especies={especies} addEspecie={addEspecie} delEspecie={delEspecie}/>}
        {tab==="notas"&&<Notas notas={notas} saveNotas={saveNotas}/>}
      </div>
    </div>
  );
}
