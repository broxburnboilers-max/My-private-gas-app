import { useState, useRef, useEffect } from "react";

// v2 - Google Contacts integration
const BLUE = "#2a52d4";
const DARK_BLUE = "#1a3bbf";
const LIGHT_BG = "#f0f2f8";

// ── helpers ──────────────────────────────────────────────────────────────────
function today() {
  return new Date();
}
function formatDate(d) {
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${days[d.getDay()]}-${String(d.getDate()).padStart(2,"0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
}
function nextYear() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

// ── shared components ─────────────────────────────────────────────────────────
function Header({ title, onBack, right }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${DARK_BLUE},${BLUE})`, padding:"16px 20px", display:"flex", alignItems:"center", gap:10, minHeight:56, flexShrink:0 }}>
      {onBack && (
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.18)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 3L5 9L11 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      <span style={{ flex:1, color:"#fff", fontWeight:700, fontSize:16, fontFamily:"'Segoe UI',sans-serif" }}>{title}</span>
      {right}
    </div>
  );
}

function BottomBar({ onHome, onNext, onOptions, nextLabel="Next" }) {
  return (
    <div style={{ display:"flex", borderTop:"1px solid #dde", background:"#f8f9fc", flexShrink:0 }}>
      <button onClick={onHome} style={{ flex:1, padding:"12px 0", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color:"#888", fontSize:11, fontFamily:"'Segoe UI',sans-serif" }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 9.5L11 3L19 9.5V19H14V14H8V19H3V9.5Z" stroke="#999" strokeWidth="1.8" strokeLinejoin="round"/></svg>
        Home
      </button>
      {onOptions ? (
        <button onClick={onOptions} style={{ flex:1, padding:"12px 0", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color:"#888", fontSize:11, fontFamily:"'Segoe UI',sans-serif" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="2" rx="1" fill="#999"/><rect x="3" y="10" width="16" height="2" rx="1" fill="#999"/><rect x="3" y="15" width="16" height="2" rx="1" fill="#999"/></svg>
          Options
        </button>
      ) : onNext ? (
        <button onClick={onNext} style={{ flex:1, padding:"12px 0", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color:"#888", fontSize:11, fontFamily:"'Segoe UI',sans-serif" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 11H17M12 6L17 11L12 16" stroke="#999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {nextLabel}
        </button>
      ) : null}
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type="text", multiline=false, maxLength }) {
  return (
    <div style={{ marginBottom:2 }}>
      {label && <div style={{ fontSize:13, color:"#888", padding:"8px 16px 2px", fontFamily:"'Segoe UI',sans-serif" }}>{label}</div>}
      {multiline ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
          style={{ width:"100%", boxSizing:"border-box", padding:"12px 16px", border:"none", borderBottom:"1px solid #e0e4ef", background:"#fff", fontSize:15, fontFamily:"'Segoe UI',sans-serif", resize:"none", height:100, outline:"none" }}/>
      ) : (
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{ width:"100%", boxSizing:"border-box", padding:"12px 16px", border:"none", borderBottom:"1px solid #e0e4ef", background:"#fff", fontSize:15, fontFamily:"'Segoe UI',sans-serif", outline:"none" }}/>
      )}
      {maxLength && <div style={{ fontSize:11, color:"#aaa", padding:"2px 16px", background:"#f8f9fc" }}>You Can Enter {maxLength} Characters</div>}
    </div>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
      {options.map(opt => (
        <label key={opt} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontFamily:"'Segoe UI',sans-serif", fontSize:14, color:"#444" }}>
          <div onClick={()=>onChange(opt)} style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${value===opt?BLUE:"#bbb"}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", background:"#fff" }}>
            {value===opt && <div style={{ width:10, height:10, borderRadius:"50%", background:BLUE }}/>}
          </div>
          {opt}
        </label>
      ))}
    </div>
  );
}

function SectionHeader({ title, actions }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${DARK_BLUE},${BLUE})`, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ color:"#fff", fontWeight:700, fontSize:14, fontFamily:"'Segoe UI',sans-serif" }}>{title}</span>
      {actions && <div style={{ display:"flex", gap:10 }}>{actions}</div>}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:400, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        {title && <div style={{ padding:"16px 20px", borderBottom:`2px solid ${BLUE}`, fontWeight:700, fontSize:16, fontFamily:"'Segoe UI',sans-serif", textAlign:"center" }}>{title}</div>}
        <div style={{ padding:20 }}>{children}</div>
        {onClose && (
          <button onClick={onClose} style={{ width:"100%", padding:16, background:BLUE, color:"#fff", border:"none", fontWeight:700, fontSize:16, cursor:"pointer", fontFamily:"'Segoe UI',sans-serif" }}>OK</button>
        )}
      </div>
    </div>
  );
}

function PickerScreen({ title, options, onSelect, onBack }) {
  const [search, setSearch] = useState("");
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title={title} onBack={onBack}/>
      <div style={{ padding:16, background:LIGHT_BG }}>
        <p style={{ color:"#888", fontSize:14, margin:"0 0 12px" }}>Please enter a value or select an item from the list</p>
        <input value={search} onChange={e=>setSearch(e.target.value)} style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", border:`2px solid ${BLUE}`, borderRadius:8, fontSize:15, outline:"none" }}/>
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
        {filtered.map(opt => (
          <div key={opt} onClick={()=>onSelect(opt)} style={{ padding:"14px 16px", background:"#fff", borderBottom:"1px solid #eee", fontSize:15, cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.background="#eef0ff"}
            onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────
function CalendarModal({ value, onChange, onClose }) {
  const [view, setView] = useState(value || new Date());
  const year = view.getFullYear();
  const month = view.getMonth();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);

  const selected = value;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:360, overflow:"hidden" }}>
        <div style={{ background:BLUE, padding:"16px 20px" }}>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13 }}>{year}</div>
          <div style={{ color:"#fff", fontSize:26, fontWeight:700 }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][selected?.getDay()]}, {months[selected?.getMonth()].slice(0,3)} {selected?.getDate()}
          </div>
        </div>
        <div style={{ padding:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <button onClick={()=>setView(new Date(year,month-1,1))} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:BLUE }}>‹</button>
            <span style={{ fontWeight:600, fontSize:15, fontFamily:"'Segoe UI',sans-serif" }}>{months[month]} {year}</span>
            <button onClick={()=>setView(new Date(year,month+1,1))} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:BLUE }}>›</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, textAlign:"center" }}>
            {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{ fontSize:12, color:"#999", fontWeight:600, padding:"4px 0" }}>{d}</div>)}
            {cells.map((d,i) => {
              const isSelected = d && selected && selected.getDate()===d && selected.getMonth()===month && selected.getFullYear()===year;
              return (
                <div key={i} onClick={d?()=>onChange(new Date(year,month,d)):undefined}
                  style={{ padding:"6px 0", borderRadius:"50%", fontSize:14, cursor:d?"pointer":"default",
                    background:isSelected?BLUE:"transparent", color:isSelected?"#fff":d?"#333":"transparent", fontWeight:isSelected?700:400 }}>
                  {d||""}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:16, padding:"8px 20px 16px" }}>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontWeight:600, cursor:"pointer", fontSize:14 }}>CANCEL</button>
          <button onClick={onClose} style={{ background:"none", border:"none", color:BLUE, fontWeight:600, cursor:"pointer", fontSize:14 }}>OK</button>
        </div>
      </div>
    </div>
  );
}

// ── SCREENS ───────────────────────────────────────────────────────────────────

// 1. Login
function LoginScreen({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${DARK_BLUE} 0%,${BLUE} 60%,${DARK_BLUE} 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", padding:24 }}>
      <div style={{ background:"#fff", borderRadius:24, padding:"40px 32px 36px", width:"100%", maxWidth:380, boxShadow:"0 20px 60px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div style={{ fontSize:56, lineHeight:1, marginBottom:12 }}>🔥</div>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#111", margin:"0 0 6px" }}>Gas Safety</h1>
        <p style={{ color:"#666", fontSize:15, margin:"0 0 2px" }}>West Lothian Gas Ltd</p>
        <p style={{ color:"#666", fontSize:15, margin:"0 0 28px" }}>Enter your password to continue</p>
        <div style={{ position:"relative", width:"100%", marginBottom:16 }}>
          <input type={show?"text":"password"} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(password?onUnlock():setError("Please enter your password."))}
            style={{ width:"100%", padding:"16px 50px 16px 18px", borderRadius:12, border:`2px solid ${BLUE}`, fontSize:16, color:"#111", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/>
          <button onClick={()=>setShow(v=>!v)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#888", padding:0 }}>{show?"🙈":"👁️"}</button>
        </div>
        {error && <p style={{ color:"#d32f2f", fontSize:13, margin:"-8px 0 12px", alignSelf:"flex-start" }}>{error}</p>}
        <button onClick={()=>password?onUnlock():setError("Please enter your password.")}
          style={{ width:"100%", padding:17, background:BLUE, color:"#fff", border:"none", borderRadius:12, fontSize:17, fontWeight:700, cursor:"pointer" }}>Unlock App</button>
      </div>
      <p style={{ color:"rgba(255,255,255,0.65)", fontSize:13, marginTop:28, textAlign:"center" }}>West Lothian Gas Ltd · Gas Safe Reg. 5927846</p>
    </div>
  );
}

// 2. Home
function HomeScreen({ onNew, onRecords }) {
  function CircleBtn({ onClick, label, children }) {
    const [hov, setHov] = useState(false);
    return (
      <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, cursor:"pointer" }}>
        <div style={{ width:110, height:110, borderRadius:"50%", border:`3px solid ${BLUE}`, display:"flex", alignItems:"center", justifyContent:"center", background:hov?"rgba(42,82,212,0.08)":"transparent", transition:"all 0.2s", transform:hov?"scale(1.07)":"scale(1)" }}>{children}</div>
        <span style={{ color:"#444", fontSize:14, fontWeight:600, fontFamily:"'Segoe UI',sans-serif" }}>{label}</span>
      </div>
    );
  }
  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${DARK_BLUE} 0%,${BLUE} 60%,${DARK_BLUE} 100%)`, display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ padding:"28px 24px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:28 }}>🔥</span>
        <div><div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>Gas Safety</div><div style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>West Lothian Gas Ltd</div></div>
      </div>
      <div style={{ flex:1, margin:"0 20px 20px", background:"#fff", borderRadius:24, boxShadow:"0 20px 60px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 32px" }}>
        <p style={{ color:"#666", fontSize:15, marginBottom:36, textAlign:"center" }}>What would you like to do?</p>
        <div style={{ display:"flex", gap:48 }}>
          <CircleBtn onClick={onNew} label="New Job">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><rect x="22" y="4" width="8" height="44" rx="4" fill={BLUE}/><rect x="4" y="22" width="44" height="8" rx="4" fill={BLUE}/></svg>
          </CircleBtn>
          <CircleBtn onClick={onRecords} label="Records">
            <svg width="56" height="48" viewBox="0 0 56 48" fill="none"><rect x="2" y="10" width="52" height="36" rx="5" fill={BLUE}/><rect x="2" y="6" width="22" height="14" rx="5" fill={BLUE}/><rect x="8" y="18" width="40" height="24" rx="3" fill="rgba(0,0,0,0.12)"/></svg>
          </CircleBtn>
        </div>
      </div>
      <p style={{ color:"rgba(255,255,255,0.65)", fontSize:13, textAlign:"center", paddingBottom:24 }}>West Lothian Gas Ltd · Gas Safe Reg. 5927846</p>
    </div>
  );
}

// 3. New Job menu
const JOB_TYPES = [
  { label:"Gas Safety Certificate", icon:"📋" },
  { label:"Boiler Service", icon:"🔧" },
  { label:"Warning Notice", icon:"⚠️" },
  { label:"Gas Works", icon:"🔩" },
  { label:"Gas Isolation", icon:"🚫" },
  { label:"Invoice", icon:"💷" },
  { label:"Quote", icon:"📝" },
];

function NewJobScreen({ onSelect, onBack, onHome }) {
  function JobRow({ icon, label, onClick }) {
    const [hov, setHov] = useState(false);
    return (
      <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", borderRadius:14, border:`2px solid ${hov?BLUE:"#e8eaf0"}`, background:hov?"rgba(42,82,212,0.04)":"#fafafa", cursor:"pointer", width:"100%", textAlign:"left", transition:"all 0.15s", marginBottom:10 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:hov?BLUE:"#eef0f8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, transition:"background 0.15s" }}>{icon}</div>
        <span style={{ fontSize:16, fontWeight:600, color:hov?BLUE:"#222", fontFamily:"'Segoe UI',sans-serif", transition:"color 0.15s" }}>{label}</span>
        <svg style={{ marginLeft:"auto", opacity:hov?1:0.3 }} width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 3L12 9L6 15" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    );
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:`linear-gradient(160deg,${DARK_BLUE} 0%,${BLUE} 60%,${DARK_BLUE} 100%)`, fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ padding:"28px 24px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.18)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 3L5 9L11 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize:28 }}>🔥</span>
        <div><div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>New Job</div><div style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>Select job type</div></div>
      </div>
      <div style={{ flex:1, margin:"0 20px 20px", background:"#fff", borderRadius:24, boxShadow:"0 20px 60px rgba(0,0,0,0.25)", overflowY:"auto", padding:20 }}>
        <p style={{ color:"#888", fontSize:14, marginBottom:16, textAlign:"center" }}>Choose a job type to continue</p>
        {JOB_TYPES.map(j => <JobRow key={j.label} icon={j.icon} label={j.label} onClick={()=>onSelect(j.label)}/>)}
      </div>
      <p style={{ color:"rgba(255,255,255,0.65)", fontSize:13, textAlign:"center", paddingBottom:24 }}>West Lothian Gas Ltd · Gas Safe Reg. 5927846</p>
    </div>
  );
}

// ── GAS SAFETY CERTIFICATE FLOW ───────────────────────────────────────────────

// Step 1: File Reference
function StepFileRef({ data, onChange, onNext, onBack, onHome }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title="Domestic/Landlord Gas Safety Certificate" onBack={onBack}/>
      <div style={{ flex:1, overflowY:"auto", padding:24 }}>
        <p style={{ color:"#888", fontSize:15, marginBottom:20, textAlign:"center" }}>Please enter a file reference</p>
        <input value={data.certRef} onChange={e=>onChange({...data,certRef:e.target.value})} placeholder="Certificate Reference"
          style={{ width:"100%", boxSizing:"border-box", padding:"14px 16px", border:"none", borderRadius:8, background:"#fff", fontSize:15, fontFamily:"'Segoe UI',sans-serif", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", outline:"none" }}/>
      </div>
      <BottomBar onHome={onHome} onNext={onNext}/>
    </div>
  );
}

// ── Google Contacts Picker ────────────────────────────────────────────────────
// Replace this with your own Google OAuth Client ID from console.cloud.google.com
const GOOGLE_CLIENT_ID = "554370268319-onp7rq06gcimldocf4h4dvuq6p224tfs.apps.googleusercontent.com";

function GoogleContactsPicker({ onSelect, onClose }) {
  const [status, setStatus] = useState("idle"); // idle | signing-in | loading | ready | error
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const signIn = () => {
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      setStatus("error");
      setErrorMsg("Google Client ID not configured. See setup instructions.");
      return;
    }
    setStatus("signing-in");
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/contacts.readonly",
      callback: (resp) => {
        if (resp.error) { setStatus("error"); setErrorMsg(resp.error); return; }
        setToken(resp.access_token);
        fetchContacts(resp.access_token);
      },
    });
    client.requestAccessToken();
  };

  const fetchContacts = async (accessToken) => {
    setStatus("loading");
    try {
      const res = await fetch(
        "https://people.googleapis.com/v1/people/me/connections?personFields=names,addresses,phoneNumbers,emailAddresses&pageSize=1000",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      const list = (data.connections || []).map(p => ({
        name: p.names?.[0]?.displayName || "",
        tel: p.phoneNumbers?.[0]?.value || "",
        email: p.emailAddresses?.[0]?.value || "",
        addr1: p.addresses?.[0]?.streetAddress || "",
        addr2: p.addresses?.[0]?.city || "",
        addr3: p.addresses?.[0]?.region || "",
        postcode: p.addresses?.[0]?.postalCode || "",
      })).filter(c => c.name).sort((a,b) => a.name.localeCompare(b.name));
      setContacts(list);
      setStatus("ready");
    } catch(e) {
      setStatus("error");
      setErrorMsg("Failed to load contacts. Please try again.");
    }
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tel.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      {/* Load Google Identity Services */}
      <script src="https://accounts.google.com/gsi/client" async></script>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:480, maxHeight:"85vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.4)" }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${DARK_BLUE},${BLUE})`, padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{ flex:1, color:"#fff", fontWeight:700, fontSize:16 }}>Google Contacts</span>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", color:"#fff", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          {status === "idle" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, gap:16 }}>
              <div style={{ fontSize:48 }}>👤</div>
              <p style={{ textAlign:"center", color:"#555", fontSize:15, margin:0 }}>Sign in with Google to search and import your contacts</p>
              <button onClick={signIn} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 24px", background:"#fff", border:"2px solid #ddd", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", color:"#333", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
                Sign in with Google
              </button>
            </div>
          )}

          {status === "signing-in" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, gap:12 }}>
              <div style={{ width:40, height:40, border:`3px solid ${BLUE}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
              <p style={{ color:"#666", fontSize:14 }}>Signing in...</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {status === "loading" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, gap:12 }}>
              <div style={{ width:40, height:40, border:`3px solid ${BLUE}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
              <p style={{ color:"#666", fontSize:14 }}>Loading your contacts...</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {status === "error" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:32, gap:16 }}>
              <div style={{ fontSize:40 }}>⚠️</div>
              <p style={{ color:"#c00", textAlign:"center", fontSize:14, margin:0 }}>{errorMsg}</p>
              {GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE" && (
                <div style={{ background:"#f8f9ff", border:`1px solid ${BLUE}`, borderRadius:10, padding:16, fontSize:12, color:"#333", lineHeight:1.8 }}>
                  <strong>Setup required:</strong><br/>
                  1. Go to <strong>console.cloud.google.com</strong><br/>
                  2. Create a project → Enable <strong>People API</strong><br/>
                  3. Create OAuth 2.0 credentials (Web app)<br/>
                  4. Add <strong>capable-queijadas-e2bf11.netlify.app</strong> as authorised origin<br/>
                  5. Replace <strong>YOUR_GOOGLE_CLIENT_ID_HERE</strong> in App.jsx
                </div>
              )}
              <button onClick={signIn} style={{ padding:"10px 24px", background:BLUE, color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>Try Again</button>
            </div>
          )}

          {status === "ready" && (
            <>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid #eee", position:"sticky", top:0, background:"#fff", zIndex:1 }}>
                <input
                  autoFocus
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  placeholder="Search by name, phone or email..."
                  style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", border:`2px solid ${BLUE}`, borderRadius:8, fontSize:14, outline:"none" }}
                />
                <p style={{ margin:"6px 0 0", fontSize:12, color:"#aaa" }}>{filtered.length} contact{filtered.length!==1?"s":""} found</p>
              </div>
              {filtered.length === 0 ? (
                <div style={{ textAlign:"center", padding:32, color:"#aaa", fontSize:14 }}>No contacts match your search</div>
              ) : filtered.map((c,i) => (
                <div key={i} onClick={()=>onSelect(c)}
                  style={{ padding:"12px 16px", borderBottom:"1px solid #f0f0f0", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f4ff"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:16, flexShrink:0 }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:"#222" }}>{c.name}</div>
                    {c.tel && <div style={{ fontSize:12, color:"#888", marginTop:1 }}>📞 {c.tel}</div>}
                    {c.email && <div style={{ fontSize:12, color:"#888", marginTop:1 }}>✉️ {c.email}</div>}
                    {c.addr1 && <div style={{ fontSize:12, color:"#aaa", marginTop:1 }}>📍 {[c.addr1,c.addr2,c.postcode].filter(Boolean).join(", ")}</div>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3L10 8L5 13" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 2: Client + Installation Details
function StepClientDetails({ data, onChange, onNext, onBack, onHome }) {
  const [picker, setPicker] = useState(null); // null | "client" | "inst"

  const copy = () => onChange({...data, instName:data.clientName, instAddr1:data.clientAddr1, instAddr2:data.clientAddr2, instAddr3:data.clientAddr3, instPostcode:data.clientPostcode, instTel:data.clientTel});

  const handleContactSelected = (c) => {
    if (picker === "client") {
      onChange({...data, clientName:c.name, clientAddr1:c.addr1, clientAddr2:c.addr2, clientAddr3:c.addr3, clientPostcode:c.postcode, clientTel:c.tel, clientEmail:c.email});
    } else {
      onChange({...data, instName:c.name, instAddr1:c.addr1, instAddr2:c.addr2, instAddr3:c.addr3, instPostcode:c.postcode, instTel:c.tel});
    }
    setPicker(null);
  };

  const ContactBtn = ({ target }) => (
    <button onClick={() => setPicker(target)} title="Import from Google Contacts"
      style={{ background:"rgba(255,255,255,0.25)", border:"2px solid rgba(255,255,255,0.8)", borderRadius:8, cursor:"pointer", padding:"4px 10px", display:"flex", alignItems:"center", gap:6 }}>
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="5" stroke="white" strokeWidth="1.8"/>
        <path d="M5 24c0-5 4-8 9-8s9 3 9 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="22" cy="22" r="5" fill="white"/>
        <path d="M22 19.5v5M19.5 22h5" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      <span style={{ color:"#fff", fontSize:12, fontWeight:600 }}>Contacts</span>
    </button>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title="Client & Installation Details" onBack={onBack}/>
      <div style={{ flex:1, overflowY:"auto" }}>
        <SectionHeader title="Client Details" actions={[<ContactBtn key="cp" target="client"/>]}/>
        {[["clientName","Name"],["clientAddr1","Address line 1"],["clientAddr2","Address line 2"],["clientAddr3","Address line 3"],["clientPostcode","Postcode"],["clientTel","Telephone"],["clientEmail","Email"]].map(([k,p])=>(
          <FormInput key={k} placeholder={p} value={data[k]||""} onChange={v=>onChange({...data,[k]:v})}/>
        ))}
        <SectionHeader title="Installation Details" actions={[
          <button key="copy" onClick={copy} style={{ background:"#fff", border:"none", borderRadius:6, padding:"4px 10px", fontSize:13, fontWeight:600, color:BLUE, cursor:"pointer" }}>Copy</button>,
          <ContactBtn key="cp" target="inst"/>
        ]}/>
        {[["instName","Name"],["instAddr1","Address line 1"],["instAddr2","Address line 2"],["instAddr3","Address line 3"],["instPostcode","Postcode"],["instTel","Telephone"]].map(([k,p])=>(
          <FormInput key={k} placeholder={p} value={data[k]||""} onChange={v=>onChange({...data,[k]:v})}/>
        ))}
        <div style={{ height:20 }}/>
      </div>
      <BottomBar onHome={onHome} onNext={onNext}/>
      {picker && (
        <GoogleContactsPicker
          onSelect={handleContactSelected}
          onClose={()=>setPicker(null)}
        />
      )}
    </div>
  );
}

// Step 3: Appliance List
function StepApplianceList({ appliances, onAdd, onEdit, onDelete, onNext, onBack, onHome }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title="" onBack={onBack}
        right={
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            {appliances.length>0 && <button onClick={onDelete} style={{ background:"none", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>DELETE</button>}
            <button onClick={onAdd} style={{ background:"none", border:"none", color:"#fff", fontSize:24, cursor:"pointer", lineHeight:1 }}>+</button>
          </div>
        }
      />
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        <p style={{ color:"#aaa", fontSize:14, marginBottom:12 }}>Appliance List :</p>
        {appliances.map((a,i)=>(
          <div key={i} onClick={()=>onEdit(i)} style={{ background:"#fff", borderRadius:10, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", cursor:"pointer" }}>
            <span style={{ fontSize:15, fontFamily:"'Segoe UI',sans-serif" }}>{a.type||a.location||`Appliance ${i+1}`}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3L10 8L5 13" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        ))}
      </div>
      <BottomBar onHome={onHome} onNext={onNext}/>
    </div>
  );
}

const LOCATIONS = ["Airing Cupboard","Attic","Basement","Bathroom","Bedroom","Cellar","Compartment","Conservatory","Dining Room","Entrance","Front Room","Garage","Hall","Kitchen","Landing","Loft","Lounge","Outhouse","Utility"];
const TYPES = ["Heat Only","System","Combi","Cooker","Fire","Hob","Space Heater"];
const FLUE_TYPES = ["FL","N/A","OF","RS"];

// Custom Numeric Keypad
function NumericKeypad({ value, onChange, onDone }) {
  const press = (key) => {
    if (key === "CLR") { onChange(""); return; }
    if (key === "NA") { onChange("NA"); return; }
    if (key === "DONE") { onDone(); return; }
    if (key === "." && value.includes(".")) return;
    onChange((value || "") + key);
  };
  const keys = [
    ["1","2","3","4","5",".","CLR"],
    ["6","7","8","9","0","NA","DONE"],
  ];
  return (
    <div style={{ background:"#3a3a3a", padding:"6px 4px", flexShrink:0 }}>
      {keys.map((row, ri) => (
        <div key={ri} style={{ display:"flex", gap:3, marginBottom: ri===0?3:0 }}>
          {row.map(key => {
            const isSpecial = key==="CLR"||key==="NA"||key==="DONE";
            const isDone = key==="DONE";
            return (
              <button key={key} onClick={()=>press(key)}
                style={{
                  flex: isDone ? 1.2 : 1,
                  padding:"14px 0",
                  background: isDone ? BLUE : isSpecial ? "#555" : "#4a4a4a",
                  color:"#fff",
                  border:"none",
                  borderRadius:4,
                  fontSize: isDone ? 13 : 18,
                  fontWeight: isSpecial ? 700 : 400,
                  cursor:"pointer",
                  fontFamily:"'Segoe UI',sans-serif",
                  letterSpacing: isSpecial ? 0.5 : 0,
                }}>
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Step 4: Appliance Form
function StepApplianceForm({ appliance, index, onSave, onBack }) {
  const [a, setA] = useState(appliance || { location:"",type:"",make:"",model:"",flueType:"",landlordsAppliance:"N/A",applianceInspected:"N/A",co2:"",co:"",combustion:"",operatingPressure:"",heatInput:"",spillageTest:"N/A",flueFlow:"N/A",ventilation:"N/A",flueVisual:"N/A",fluePerformance:"N/A",applianceServiced:"N/A",applianceSafe:"N/A",safetyDevices:"N/A" });
  const [picker, setPicker] = useState(null);
  const [activeKeypad, setActiveKeypad] = useState(null); // "co2" | "co" | "combustion"
  const set = (k,v) => setA(p=>({...p,[k]:v}));

  if(picker==="location") return <PickerScreen title="Location" options={LOCATIONS} onSelect={v=>{set("location",v);setPicker(null);}} onBack={()=>setPicker(null)}/>;
  if(picker==="type") return <PickerScreen title="Type" options={TYPES} onSelect={v=>{set("type",v);setPicker(null);}} onBack={()=>setPicker(null)}/>;
  if(picker==="flueType") return <PickerScreen title="Flue Type" options={FLUE_TYPES} onSelect={v=>{set("flueType",v);setPicker(null);}} onBack={()=>setPicker(null)}/>;

  function PickField({ label, field }) {
    return (
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px", background:"#fff", borderBottom:"1px solid #eee" }}>
        <span style={{ flex:1, fontSize:14, color:"#666", fontFamily:"'Segoe UI',sans-serif" }}>{label}:</span>
        <button onClick={()=>setPicker(field)} style={{ padding:"6px 12px", background:LIGHT_BG, border:`1px solid #ddd`, borderRadius:6, fontSize:14, cursor:"pointer", minWidth:100, textAlign:"left", color:a[field]?"#222":"#aaa" }}>
          {a[field]||"Select..."}
        </button>
      </div>
    );
  }

  function ReadingField({ label, field }) {
    const isActive = activeKeypad === field;
    return (
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px", background: isActive ? "#eef1ff" : "#fff", borderBottom:"1px solid #eee", gap:12, borderLeft: isActive ? `3px solid ${BLUE}` : "3px solid transparent" }}>
        <span style={{ flex:1, fontSize:14, color:"#666", fontFamily:"'Segoe UI',sans-serif", lineHeight:1.3 }}>{label}</span>
        <span style={{ color:BLUE, fontSize:22, fontWeight:700 }}>+</span>
        <div onClick={()=>setActiveKeypad(isActive ? null : field)}
          style={{ width:120, padding:"6px 10px", border:`2px solid ${isActive?BLUE:"#ddd"}`, borderRadius:6, fontSize:14, background:"#fff", cursor:"pointer", minHeight:32, display:"flex", alignItems:"center", color: a[field] ? "#222" : "#aaa" }}>
          {a[field] || <span style={{color:"#ccc"}}>tap to enter</span>}
        </div>
      </div>
    );
  }

  function RadioRow({ label, field, options }) {
    return (
      <div style={{ padding:"14px 16px", background:"#fff", borderBottom:"1px solid #eee" }}>
        <div style={{ fontSize:14, color:"#666", marginBottom:8, fontFamily:"'Segoe UI',sans-serif", lineHeight:1.3 }}>{label}</div>
        <RadioGroup options={options} value={a[field]} onChange={v=>set(field,v)}/>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title={`Appliance ${index+1}`} onBack={onBack}
        right={<button onClick={()=>onSave(a)} style={{ background:"none", border:"none", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>Done</button>}/>
      <div style={{ flex:1, overflowY:"auto" }} onClick={e => { if(!e.target.closest("[data-keypad-field]")) {} }}>
        <PickField label="Location" field="location" />
        <PickField label="Type" field="type" />
        <div style={{ padding:"12px 16px", background:"#fff", borderBottom:"1px solid #eee" }}>
          <span style={{ fontSize:14, color:"#666" }}>Make:</span>
          <input value={a.make||""} onChange={e=>set("make",e.target.value)} onFocus={()=>setActiveKeypad(null)} style={{ marginLeft:12, padding:"6px 10px", border:`1px solid #ddd`, borderRadius:6, fontSize:14, outline:"none", width:"60%" }}/>
        </div>
        <div style={{ padding:"12px 16px", background:"#fff", borderBottom:"1px solid #eee" }}>
          <span style={{ fontSize:14, color:"#666" }}>Model:</span>
          <input value={a.model||""} onChange={e=>set("model",e.target.value)} onFocus={()=>setActiveKeypad(null)} style={{ marginLeft:12, padding:"6px 10px", border:`1px solid #ddd`, borderRadius:6, fontSize:14, outline:"none", width:"60%" }}/>
        </div>
        <PickField label="Flue Type" field="flueType" />
        <RadioRow label="Landlords Appliance" field="landlordsAppliance" options={["Yes","No","N/A"]}/>
        <RadioRow label="Appliance Inspected" field="applianceInspected" options={["Yes","No","N/A","VIO"]}/>
        <ReadingField label="CO2 Reading" field="co2"/>
        <ReadingField label="CO Reading" field="co"/>
        <ReadingField label="Combustion Analyser Reading CO/CO2 Ratio" field="combustion"/>
        <div style={{ padding:"12px 16px", background:"#fff", borderBottom:"1px solid #eee" }}>
          <span style={{ fontSize:14, color:"#666" }}>Operating Pressure</span>
          <input value={a.operatingPressure||""} onChange={e=>set("operatingPressure",e.target.value)} onFocus={()=>setActiveKeypad(null)} style={{ display:"block", width:"100%", marginTop:6, padding:"6px 10px", border:`1px solid #ddd`, borderRadius:6, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <div style={{ padding:"12px 16px", background:"#fff", borderBottom:"1px solid #eee" }}>
          <span style={{ fontSize:14, color:"#666" }}>Heat Input</span>
          <input value={a.heatInput||""} onChange={e=>set("heatInput",e.target.value)} onFocus={()=>setActiveKeypad(null)} style={{ display:"block", width:"100%", marginTop:6, padding:"6px 10px", border:`1px solid #ddd`, borderRadius:6, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <RadioRow label="Spillage Test" field="spillageTest" options={["Pass","Fail","N/A"]}/>
        <RadioRow label="Flue Flow" field="flueFlow" options={["Pass","Fail","N/A"]}/>
        <RadioRow label="Ventilation Provision Satisfactory" field="ventilation" options={["Yes","No","N/A"]}/>
        <RadioRow label="Flue Visual Condition And Termination Satisfactory" field="flueVisual" options={["Yes","No","N/A"]}/>
        <RadioRow label="Flue Performance Tests" field="fluePerformance" options={["Pass","Fail","N/A"]}/>
        <RadioRow label="Appliance Serviced" field="applianceServiced" options={["Yes","No","N/A"]}/>
        <RadioRow label="Appliance Safe To Use" field="applianceSafe" options={["Yes","No","N/A"]}/>
        <RadioRow label="Safety Devices(s) Correct Operation" field="safetyDevices" options={["Yes","No","N/A"]}/>
        <div style={{ height:20 }}/>
      </div>
      {activeKeypad && (
        <NumericKeypad
          value={a[activeKeypad]||""}
          onChange={v=>set(activeKeypad,v)}
          onDone={()=>setActiveKeypad(null)}
        />
      )}
    </div>
  );
}

// Step 5: Faults List
function StepFaultList({ faults, onAdd, onEdit, onDelete, onNext, onBack, onHome }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title="" onBack={onBack}
        right={<button onClick={onAdd} style={{ background:"none", border:"none", color:"#fff", fontSize:24, cursor:"pointer" }}>+</button>}/>
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        <p style={{ color:"#aaa", fontSize:14, marginBottom:12 }}>Fault :</p>
        {faults.map((f,i)=>(
          <div key={i} onClick={()=>onEdit(i)} style={{ background:"#fff", borderRadius:10, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", cursor:"pointer" }}>
            <span style={{ fontSize:15, fontFamily:"'Segoe UI',sans-serif" }}>{f.details?f.details.slice(0,40)+"...":f.remedial?f.remedial.slice(0,40)+"...":"Fault "+(i+1)}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3L10 8L5 13" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        ))}
      </div>
      <BottomBar onHome={onHome} onNext={onNext}/>
    </div>
  );
}

// Step 6: Fault Form
function StepFaultForm({ fault, index, onSave, onBack }) {
  const [f, setF] = useState(fault || { details:"", remedial:"", warningNotice:"Yes" });
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title={`Faults ${index+1}`} onBack={onBack}
        right={<button onClick={()=>onSave(f)} style={{ background:"none", border:"none", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>DONE</button>}/>
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ padding:16, background:LIGHT_BG }}>
          <p style={{ fontSize:14, color:"#666", marginBottom:8, fontFamily:"'Segoe UI',sans-serif" }}>Details Of Any Faults</p>
          <textarea value={f.details} onChange={e=>setF(p=>({...p,details:e.target.value}))} maxLength={200}
            style={{ width:"100%", boxSizing:"border-box", padding:12, border:"none", borderRadius:8, background:"#fff", fontSize:14, fontFamily:"'Segoe UI',sans-serif", resize:"none", height:100, outline:"none", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}/>
          <p style={{ fontSize:11, color:"#aaa", marginTop:4 }}>You Can Enter 200 Characters</p>

          <p style={{ fontSize:14, color:"#666", marginBottom:8, marginTop:16, fontFamily:"'Segoe UI',sans-serif" }}>Remedial Action Taken</p>
          <textarea value={f.remedial} onChange={e=>setF(p=>({...p,remedial:e.target.value}))} maxLength={200}
            style={{ width:"100%", boxSizing:"border-box", padding:12, border:"none", borderRadius:8, background:"#fff", fontSize:14, fontFamily:"'Segoe UI',sans-serif", resize:"none", height:100, outline:"none", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}/>
          <p style={{ fontSize:11, color:"#aaa", marginTop:4 }}>You Can Enter 200 Characters</p>

          <p style={{ fontSize:14, color:"#666", marginTop:16, marginBottom:8, fontFamily:"'Segoe UI',sans-serif" }}>Label And Warning Notice Issued :</p>
          <RadioGroup options={["Yes","No","N/A"]} value={f.warningNotice} onChange={v=>setF(p=>({...p,warningNotice:v}))}/>
        </div>
      </div>
    </div>
  );
}

// Step 7: Final Checks
function StepFinalChecks({ data, onChange, onNext, onBack, onHome }) {
  const [showCal, setShowCal] = useState(false);
  const inspDate = data.inspectionDate || nextYear();

  function ToggleBtn({ label, field }) {
    const val = data[field] || "YES";
    return (
      <div style={{ display:"flex", alignItems:"center", padding:"14px 16px", background:"#fff", borderBottom:"1px solid #eee" }}>
        <span style={{ flex:1, fontSize:14, color:"#666", fontFamily:"'Segoe UI',sans-serif" }}>{label}</span>
        <button onClick={()=>onChange({...data,[field]:val==="YES"?"NO":"YES"})}
          style={{ padding:"6px 16px", background:val==="YES"?BLUE:"#e74c3c", color:"#fff", border:"none", borderRadius:6, fontWeight:700, fontSize:13, cursor:"pointer", minWidth:60 }}>{val}</button>
      </div>
    );
  }
  function RadioRow({ label, field, options }) {
    return (
      <div style={{ padding:"14px 16px", background:"#fff", borderBottom:"1px solid #eee" }}>
        <div style={{ fontSize:14, color:"#666", marginBottom:8, fontFamily:"'Segoe UI',sans-serif" }}>{label}</div>
        <RadioGroup options={options} value={data[field]||"N/A"} onChange={v=>onChange({...data,[field]:v})}/>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title="Final Checks" onBack={onBack}/>
      <div style={{ flex:1, overflowY:"auto" }}>
        <RadioRow label="Gas Tightness Pass" field="gasTightness" options={["Yes","No","N/A"]}/>
        <ToggleBtn label="Gas Pipe Work Visual Pass" field="pipeworkVisual"/>
        <ToggleBtn label="Emergency Control Accessible" field="emergencyControl"/>
        <ToggleBtn label="Equipotential Bonding" field="bonding"/>
        <ToggleBtn label="Installation Pass" field="installationPass"/>
        <div style={{ padding:"14px 16px", background:"#fff", borderBottom:"1px solid #eee", display:"flex", alignItems:"center" }}>
          <span style={{ flex:1, fontSize:13, color:"#666", fontFamily:"'Segoe UI',sans-serif", textTransform:"uppercase", fontWeight:600 }}>Next Inspection Due On Or Before</span>
          <button onClick={()=>setShowCal(true)} style={{ padding:"6px 12px", background:"#fff", border:`2px solid ${BLUE}`, borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", color:"#222" }}>{formatDate(inspDate)}</button>
        </div>
        <RadioRow label="CO alarm fitted and working?" field="coAlarm" options={["Yes","No","N/A"]}/>
        <RadioRow label="Smoke alarm fitted and working?" field="smokeAlarm" options={["Yes","No","N/A"]}/>
        <div style={{ height:20 }}/>
      </div>
      <BottomBar onHome={onHome} onNext={onNext}/>
      {showCal && <CalendarModal value={inspDate} onChange={d=>onChange({...data,inspectionDate:d})} onClose={()=>setShowCal(false)}/>}
    </div>
  );
}

// Step 8: Signature
function StepSignature({ data, onChange, onNext, onBack, onHome }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return [src.clientX - rect.left, src.clientY - rect.top];
  };
  const startDraw = e => { drawing.current=true; const [x,y]=getPos(e,canvasRef.current); const ctx=canvasRef.current.getContext("2d"); ctx.beginPath(); ctx.moveTo(x,y); };
  const draw = e => { if(!drawing.current) return; e.preventDefault(); const [x,y]=getPos(e,canvasRef.current); const ctx=canvasRef.current.getContext("2d"); ctx.lineWidth=2; ctx.strokeStyle=BLUE; ctx.lineTo(x,y); ctx.stroke(); };
  const endDraw = () => { drawing.current=false; };
  const clean = () => { const c=canvasRef.current; c.getContext("2d").clearRect(0,0,c.width,c.height); };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title="Signature" onBack={onBack}/>
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ background:"#fff", margin:16, borderRadius:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
          <canvas ref={canvasRef} width={360} height={180} style={{ display:"block", width:"100%", touchAction:"none", cursor:"crosshair" }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}/>
        </div>
        <div style={{ padding:"0 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <input type="checkbox" id="dp" checked={data.dataProtection||false} onChange={e=>onChange({...data,dataProtection:e.target.checked})} style={{ width:18, height:18, cursor:"pointer" }}/>
            <label htmlFor="dp" style={{ fontSize:15, color:"#333", cursor:"pointer" }}>Data Protection</label>
            <button onClick={()=>setShowPrivacy(true)} style={{ marginLeft:"auto", background:"none", border:`2px solid ${BLUE}`, borderRadius:"50%", width:30, height:30, color:BLUE, fontWeight:700, cursor:"pointer", fontSize:14 }}>i</button>
          </div>
          <p style={{ fontSize:14, color:"#666", marginBottom:6 }}>Customer Declaration:</p>
          <input value={data.customerDeclaration||""} onChange={e=>onChange({...data,customerDeclaration:e.target.value})}
            style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", border:"none", borderRadius:8, background:"#fff", fontSize:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", outline:"none", marginBottom:16 }}/>
          <p style={{ fontSize:14, color:"#666", marginBottom:6 }}>Signature:</p>
          <div style={{ background:"#f8f9fc", borderRadius:8, padding:8, minHeight:60, fontSize:13, color:"#aaa", fontStyle:"italic" }}>Draw signature above</div>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", padding:"8px 16px 24px" }}>
          <button onClick={clean} style={{ padding:"10px 24px", background:BLUE, color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:14, cursor:"pointer" }}>CLEAN</button>
        </div>
      </div>
      <BottomBar onHome={onHome} onNext={onNext}/>
      {showPrivacy && (
        <Modal title="Data Privacy Act" onClose={()=>setShowPrivacy(false)}>
          <p style={{ fontSize:14, lineHeight:1.7, color:"#333", textAlign:"center", fontFamily:"'Segoe UI',sans-serif", fontWeight:600 }}>
            You agree to allow us to store your Name, email, telephone number and your address in line with the new GDPR data protection laws. We may contact you in future by email or sms to let you know that your Gas Appliances or Property requires servicing or an annual Gas Safety Inspection. You can opt out at any point and your details can be deleted on request. Your details will not be shared to any other third parties and will be stored in secure, encrypted dedicated servers within the EU.
          </p>
        </Modal>
      )}
    </div>
  );
}

// Step 9: Engineer/Company Details
function StepEngineerDetails({ data, onChange, onOptions, onBack, onHome }) {
  const [showCal, setShowCal] = useState(false);
  const certDate = data.certDate || today();

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title="Engineer Details" onBack={onBack}/>
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ padding:"8px 16px 4px", background:LIGHT_BG }}>
          <p style={{ fontSize:13, color:"#888", margin:"8px 0 4px", fontWeight:600 }}>Company Details</p>
        </div>
        <FormInput placeholder="Company Name" value={data.companyName||""} onChange={v=>onChange({...data,companyName:v})}/>
        <div style={{ padding:"8px 16px 4px", background:LIGHT_BG }}><p style={{ fontSize:13, color:"#888", margin:"4px 0", fontWeight:600 }}>Address</p></div>
        <FormInput placeholder="Address" value={data.companyAddr||""} onChange={v=>onChange({...data,companyAddr:v})} multiline/>
        <FormInput placeholder="Postcode" value={data.companyPostcode||""} onChange={v=>onChange({...data,companyPostcode:v})}/>
        <FormInput placeholder="Telephone" value={data.companyTel||""} onChange={v=>onChange({...data,companyTel:v})}/>
        <FormInput placeholder="Gas Safe Registration No." value={data.gasSafeNo||""} onChange={v=>onChange({...data,gasSafeNo:v})}/>
        <div style={{ padding:"8px 16px 4px", background:LIGHT_BG }}><p style={{ fontSize:13, color:"#888", margin:"8px 0 4px", fontWeight:600 }}>Report Issued By</p></div>
        <FormInput placeholder="Engineer Name" value={data.engineerName||""} onChange={v=>onChange({...data,engineerName:v})}/>
        <FormInput placeholder="Gas ID Number" value={data.gasId||""} onChange={v=>onChange({...data,gasId:v})}/>
        <div style={{ padding:"12px 16px", background:"#fff", borderBottom:"1px solid #eee", display:"flex", alignItems:"center" }}>
          <span style={{ flex:1, fontSize:14, color:"#666" }}>Date</span>
          <button onClick={()=>setShowCal(true)} style={{ padding:"6px 12px", background:"#fff", border:`2px solid ${BLUE}`, borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", color:"#222" }}>{formatDate(certDate)}</button>
        </div>
        <div style={{ height:20 }}/>
      </div>
      <BottomBar onHome={onHome} onOptions={onOptions}/>
      {showCal && <CalendarModal value={certDate} onChange={d=>onChange({...data,certDate:d})} onClose={()=>setShowCal(false)}/>}
    </div>
  );
}

// Options menu
function OptionsMenu({ onPreview, onSave, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"flex-end", zIndex:1000 }} onClick={onClose}>
      <div style={{ width:"100%", background:"#fff", borderRadius:"20px 20px 0 0", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
        {[["PREVIEW PDF", onPreview],["SAVE", onSave],["COPY TO INVOICE", onClose]].map(([label, action])=>(
          <button key={label} onClick={action} style={{ display:"block", width:"100%", padding:20, background:"#fff", border:"none", borderBottom:"1px solid #eee", fontSize:16, fontWeight:600, color:"#555", cursor:"pointer", fontFamily:"'Segoe UI',sans-serif", letterSpacing:0.5 }}>{label}</button>
        ))}
        <div style={{ height:20 }}/>
      </div>
    </div>
  );
}

// PDF Preview
function PDFPreview({ certData, appliances, faults, finalChecks, engineerData, onClose }) {
  const inspDate = finalChecks.inspectionDate || nextYear();
  const certDate = engineerData.certDate || today();
  const ref = certData.certRef || ("GSC-" + Date.now());
  const certNo = "GSC-" + Date.now();

  const HEADER_BG = "#1a3a8f";
  const bd = "1px solid #999";

  // Format date as DD/MM/YYYY
  const fmtShort = (d) => {
    if (!d) return "";
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const applianceRows = [...appliances, ...Array(Math.max(0, 5 - appliances.length)).fill({})];
  const faultRows = [...faults, ...Array(Math.max(0, 5 - faults.length)).fill({})];

  const rotatedHeaders = [
    "CO2 Reading (%)",
    "CO Reading (ppm)",
    "Flue Type (OF/RS/FL)",
    "Appliance Inspected (YES/NO/NA/VIO)",
    "Combustion Analysis Reading (CO/CO2)",
    "Landlords Appliance (YES/NO/NA)",
    "Operating Pressure (mbar)",
    "Heat Input (KW)",
    "Safety Device(s) Correct Operation (YES/NO/NA)",
    "Ventilation Provision Satisfactory (YES/NO)",
    "Visual Condition Of Flue and Termination Satisfactory (YES/NO/NA)",
    "Flue Performance Test (PASS/FAIL/NA)",
    "Appliance Serviced (YES/NO/NA)",
    "Appliance Safe To Use (YES/NO)",
  ];

  const applianceDataFields = ["co2","co","flueType","applianceInspected","combustion","landlordsAppliance","operatingPressure","heatInput","safetyDevices","ventilation","flueVisual","fluePerformance","applianceServiced","applianceSafe"];

  const cell = (content, extra={}) => ({
    padding:"3px 4px", border:bd, fontSize:9, verticalAlign:"middle", textAlign:"center", ...extra
  });

  return (
    <div style={{ position:"fixed", inset:0, background:"#666", zIndex:2000, overflowY:"auto", fontFamily:"Arial,Helvetica,sans-serif" }}>
      {/* Sticky top bar */}
      <div style={{ background:`linear-gradient(135deg,${DARK_BLUE},${BLUE})`, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 }}>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 3L5 9L11 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ color:"#fff", fontWeight:700, fontSize:16 }}>PDF Preview</span>
      </div>

      {/* Certificate page */}
      <div style={{ background:"#fff", margin:"12px auto 24px", maxWidth:900, padding:"16px 20px", boxShadow:"0 4px 24px rgba(0,0,0,0.4)", fontSize:10 }}>

        {/* Title row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div style={{ flex:1 }}>
            {/* Logo placeholder */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <div style={{ width:50, height:50, border:"2px solid #c00", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#c00", fontWeight:700, textAlign:"center", lineHeight:1.2 }}>GAS<br/>SAFE</div>
              <div>
                <div style={{ fontSize:16, fontWeight:900, color:BLUE }}>West Lothian Gas</div>
                <div style={{ fontSize:9, color:"#555" }}>Gas Safety Specialists</div>
              </div>
            </div>
          </div>
          <div style={{ flex:2, textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:900, letterSpacing:0.5 }}>Domestic/Landlord Gas Safety Record</div>
            <div style={{ fontSize:8, color:"#555", marginTop:3, lineHeight:1.5 }}>
              Safety inspection and reporting carried out in accordance with Gas Safety (Installation and Use) Regulations and the Gas Industry Unsafe Situations Procedure.<br/>
              Unless stated otherwise, no detailed internal inspection of flues (Integrity, Construction and Lining) has been carried out.<br/>
              This safety check complies with (but is not limited to) Regulation 26(9) of GSIUR. (VIO = Visual Inspection Only)
            </div>
          </div>
          <div style={{ flex:1, textAlign:"right" }}>
            <div style={{ fontSize:9, fontWeight:700 }}>Certificate Reference</div>
            <div style={{ border:bd, padding:"2px 6px", marginTop:2, fontSize:9, display:"inline-block", minWidth:160, textAlign:"left" }}>{ref}</div>
            <div style={{ marginTop:4, fontSize:9 }}>Certificate No: {certNo}</div>
          </div>
        </div>

        {/* Engineers / Installation / Client details */}
        <table style={{ width:"100%", borderCollapse:"collapse", marginTop:6 }}>
          <thead>
            <tr>
              {["Engineers Details","Installation Details","Client Details"].map(h=>(
                <th key={h} style={{ background:HEADER_BG, color:"#fff", padding:"5px 8px", textAlign:"left", fontSize:10, border:bd, width:"33.3%" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border:bd, padding:"6px 8px", verticalAlign:"top", fontSize:9 }}>
                <div><strong>Trading Title</strong> &nbsp;{engineerData.companyName||"West Lothian Gas Ltd"}</div>
                <div style={{ marginTop:3 }}><strong>Address</strong> &nbsp;{engineerData.companyAddr||""}</div>
                <div style={{ marginTop:8 }}><strong>Post Code:</strong> {engineerData.companyPostcode||""}</div>
              </td>
              <td style={{ border:bd, padding:"6px 8px", verticalAlign:"top", fontSize:9 }}>
                <div><strong>Installation Address</strong></div>
                <div>{certData.instName||""}</div>
                <div>{certData.instAddr1||""}</div>
                <div>{certData.instAddr2||""}</div>
                <div>{certData.instAddr3||""}</div>
                <div style={{ marginTop:8 }}><strong>Post Code:</strong> {certData.instPostcode||""}</div>
              </td>
              <td style={{ border:bd, padding:"6px 8px", verticalAlign:"top", fontSize:9 }}>
                <div><strong>Client</strong> &nbsp;{certData.clientName||""}</div>
                <div style={{ marginTop:3 }}><strong>Address</strong> &nbsp;{certData.clientAddr1||""}</div>
                <div>{certData.clientAddr2||""}</div>
                <div>{certData.clientAddr3||""}</div>
                <div style={{ marginTop:8 }}><strong>Post Code:</strong> {certData.clientPostcode||""}</div>
              </td>
            </tr>
            <tr>
              <td style={{ border:bd, padding:"4px 8px", fontSize:9 }}>
                <strong>Gas Safe No:</strong> {engineerData.gasSafeNo||"5927846"} &nbsp;&nbsp; <strong>Telephone No:</strong> {engineerData.companyTel||""}
              </td>
              <td style={{ border:bd, padding:"4px 8px", fontSize:9 }}>
                <strong>Telephone No:</strong> {certData.instTel||""}
              </td>
              <td style={{ border:bd, padding:"4px 8px", fontSize:9 }}>
                <strong>Telephone No:</strong> {certData.clientTel||""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Appliance details header row */}
        <table style={{ width:"100%", borderCollapse:"collapse", marginTop:6 }}>
          <thead>
            <tr>
              <th colSpan={5} style={{ background:HEADER_BG, color:"#fff", padding:"5px 8px", textAlign:"left", fontSize:10, border:bd }}>Appliance Details</th>
              <th colSpan={14} style={{ background:HEADER_BG, color:"#fff", padding:"5px 8px", textAlign:"left", fontSize:10, border:bd }}>Inspection Details</th>
            </tr>
            <tr style={{ background:HEADER_BG, color:"#fff" }}>
              {/* Fixed headers */}
              {["","Location","Appliance Type","Make","Model"].map((h,i)=>(
                <th key={i} style={{ border:bd, padding:"4px 3px", fontSize:9, textAlign:"center", width: i===0?"20px":"60px", verticalAlign:"bottom" }}>{h}</th>
              ))}
              {/* Rotated headers */}
              {rotatedHeaders.map((h,i)=>(
                <th key={i} style={{ border:bd, width:28, padding:2, verticalAlign:"bottom", textAlign:"center" }}>
                  <div style={{ writingMode:"vertical-rl", transform:"rotate(180deg)", fontSize:8, height:90, display:"flex", alignItems:"center", justifyContent:"flex-start", whiteSpace:"nowrap", color:"#fff", fontWeight:600 }}>{h}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applianceRows.map((a, i) => (
              <tr key={i}>
                <td style={cell(i+1)}>{i+1}</td>
                <td style={{...cell(), textAlign:"left", fontSize:9}}>{a.location||""}</td>
                <td style={{...cell(), textAlign:"left", fontSize:9}}>{a.type||""}</td>
                <td style={{...cell(), textAlign:"left", fontSize:9}}>{a.make||""}</td>
                <td style={{...cell(), textAlign:"left", fontSize:9}}>{a.model||""}</td>
                {applianceDataFields.map((f,fi)=>(
                  <td key={fi} style={cell()}>{a[f]||""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Faults table */}
        <table style={{ width:"100%", borderCollapse:"collapse", marginTop:6 }}>
          <thead>
            <tr>
              <th style={{ background:HEADER_BG, color:"#fff", padding:"5px 8px", textAlign:"left", fontSize:10, border:bd, width:"5%" }}></th>
              <th style={{ background:HEADER_BG, color:"#fff", padding:"5px 8px", textAlign:"left", fontSize:10, border:bd, width:"42%" }}>Faults/Notes</th>
              <th style={{ background:HEADER_BG, color:"#fff", padding:"5px 8px", textAlign:"left", fontSize:10, border:bd, width:"42%" }}>Remedial Work Taken</th>
              <th style={{ background:HEADER_BG, color:"#fff", padding:"5px 8px", textAlign:"center", fontSize:10, border:bd, width:"11%" }}>Warning Notice Fixed</th>
            </tr>
          </thead>
          <tbody>
            {faultRows.map((f, i) => (
              <tr key={i}>
                <td style={cell(i+1, { textAlign:"center" })}>{i+1}</td>
                <td style={{ ...cell(), textAlign:"left", minHeight:18, height:18 }}>{f.details||""}</td>
                <td style={{ ...cell(), textAlign:"left" }}>{f.remedial||""}</td>
                <td style={{ ...cell() }}>{f.warningNotice||""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom section: checks + signatures */}
        <table style={{ width:"100%", borderCollapse:"collapse", marginTop:6 }}>
          <tbody>
            <tr>
              {/* Left checks block */}
              <td style={{ border:bd, padding:"6px 8px", verticalAlign:"top", width:"55%" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"2px 8px", fontSize:9 }}>
                  <div>Emergency Control Valve Accessible:</div>
                  <div style={{ border:bd, padding:"1px 6px", minWidth:40, textAlign:"center" }}>{finalChecks.emergencyControl||""}</div>
                  <div>Gas Tightness Satisfactory:</div>
                  <div style={{ border:bd, padding:"1px 6px", minWidth:40, textAlign:"center" }}>{finalChecks.gasTightness||""}</div>
                  <div>Gas Installation Pipework Visual Inspection Satisfactory:</div>
                  <div style={{ border:bd, padding:"1px 6px", minWidth:40, textAlign:"center" }}>{finalChecks.pipeworkVisual||""}</div>
                  <div>Number of Appliances Tested:</div>
                  <div style={{ border:bd, padding:"1px 6px", minWidth:40, textAlign:"center" }}>{appliances.length||""}</div>
                  <div>Equipotential Bonding:</div>
                  <div style={{ border:bd, padding:"1px 6px", minWidth:40, textAlign:"center" }}>{finalChecks.bonding||""}</div>
                  <div style={{ fontWeight:700, textTransform:"uppercase" }}>Next Inspection Due On Or Before:</div>
                  <div style={{ border:bd, padding:"1px 6px", minWidth:60, textAlign:"center", fontWeight:700 }}>{fmtShort(inspDate)}</div>
                  <div>Installation Pass:</div>
                  <div style={{ border:bd, padding:"1px 6px", minWidth:40, textAlign:"center" }}>{finalChecks.installationPass||""}</div>
                  <div>CO Alarm fitted & working?</div>
                  <div style={{ border:bd, padding:"1px 6px", minWidth:40, textAlign:"center" }}>{finalChecks.coAlarm||""}</div>
                  <div>Smoke alarm fitted & working?</div>
                  <div style={{ border:bd, padding:"1px 6px", minWidth:40, textAlign:"center" }}>{finalChecks.smokeAlarm||""}</div>
                </div>
              </td>

              {/* Signatures block */}
              <td style={{ border:bd, padding:"6px 8px", verticalAlign:"top", width:"35%" }}>
                <div style={{ fontWeight:700, fontSize:10, marginBottom:6, background:HEADER_BG, color:"#fff", padding:"3px 6px", margin:"-6px -8px 6px" }}>Signatures</div>
                <div style={{ fontSize:9 }}>
                  <div style={{ fontWeight:700, marginBottom:4 }}>Report Issued By:</div>
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:4 }}>
                    <span>Name:</span>
                    <span style={{ flex:1, borderBottom:bd }}>{engineerData.engineerName||""}</span>
                  </div>
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:4 }}>
                    <span>Signed:</span>
                    <span style={{ flex:1, borderBottom:bd, minHeight:14 }}>&nbsp;</span>
                  </div>
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:8 }}>
                    <span>Date:</span>
                    <span style={{ border:bd, padding:"1px 6px", minWidth:70 }}>{fmtShort(certDate)}</span>
                  </div>
                  <div style={{ fontWeight:700, marginBottom:4 }}>Report Received By:</div>
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:4 }}>
                    <span>Name:</span>
                    <span style={{ flex:1, borderBottom:bd }}>{certData.clientName||""}</span>
                  </div>
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:4 }}>
                    <span>Signed:</span>
                    <span style={{ flex:1, borderBottom:bd, minHeight:14 }}>&nbsp;</span>
                  </div>
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    <span>Date:</span>
                    <span style={{ border:bd, padding:"1px 6px", minWidth:70 }}>{fmtShort(certDate)}</span>
                  </div>
                </div>
              </td>

              {/* Gas ID block */}
              <td style={{ border:bd, padding:"6px 8px", verticalAlign:"top", width:"10%" }}>
                <div style={{ fontSize:9, fontWeight:700 }}>Gas ID Number:</div>
                <div style={{ fontSize:13, fontWeight:900, marginTop:4 }}>{engineerData.gasId||engineerData.gasSafeNo||"5927846"}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ textAlign:"center", fontSize:8, color:"#666", marginTop:8, borderTop:"1px solid #ccc", paddingTop:6 }}>
          This Gas Safety Report was produced by {engineerData.companyName||"West Lothian Gas Ltd"} | Gas Safe Reg: {engineerData.gasSafeNo||"5927846"} | Tel: {engineerData.companyTel||""} | www.westlothiangas.com
          <br/>For appliances not owned by the Landlord the recorded 'Appliance Safe' response is based on a visual check for obvious defects only.
        </div>
      </div>
    </div>
  );
}

// Records Screen
function RecordsScreen({ records, onBack, onHome }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:LIGHT_BG, fontFamily:"'Segoe UI',sans-serif" }}>
      <Header title="Saved Records" onBack={onBack}/>
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {records.length===0 ? (
          <div style={{ textAlign:"center", color:"#aaa", marginTop:60, fontSize:15 }}>No saved records yet</div>
        ) : records.map((r,i)=>(
          <div key={i} style={{ background:"#fff", borderRadius:10, padding:"14px 16px", marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight:700, fontSize:15, color:"#222" }}>{r.certData?.clientName||"Unknown Client"}</div>
            <div style={{ fontSize:13, color:"#888", marginTop:4 }}>{r.certData?.instAddr1} · {r.certData?.certRef}</div>
            <div style={{ fontSize:12, color:BLUE, marginTop:4 }}>{r.appliances?.length||0} appliance(s)</div>
          </div>
        ))}
      </div>
      <BottomBar onHome={onHome}/>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [subScreen, setSubScreen] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [records, setRecords] = useState([]);

  const [certData, setCertData] = useState({ certRef:"", clientName:"", clientAddr1:"", clientAddr2:"", clientAddr3:"", clientPostcode:"", clientTel:"", clientEmail:"", instName:"", instAddr1:"", instAddr2:"", instAddr3:"", instPostcode:"", instTel:"" });
  const [appliances, setAppliances] = useState([]);
  const [faults, setFaults] = useState([]);
  const [finalChecks, setFinalChecks] = useState({});
  const [signatureData, setSignatureData] = useState({});
  const [engineerData, setEngineerData] = useState({ companyName:"West Lothian Gas Ltd", gasSafeNo:"5927846" });

  const goHome = () => { setScreen("home"); setSubScreen(null); };

  // Appliance editing
  if (subScreen === "applianceForm") {
    return <StepApplianceForm appliance={editIndex!==null?appliances[editIndex]:null} index={editIndex!==null?editIndex:appliances.length}
      onSave={a => { const arr=[...appliances]; if(editIndex!==null) arr[editIndex]=a; else arr.push(a); setAppliances(arr); setSubScreen("applianceList"); setEditIndex(null); }}
      onBack={() => { setSubScreen("applianceList"); setEditIndex(null); }}/>;
  }
  if (subScreen === "faultForm") {
    return <StepFaultForm fault={editIndex!==null?faults[editIndex]:null} index={editIndex!==null?editIndex:faults.length}
      onSave={f => { const arr=[...faults]; if(editIndex!==null) arr[editIndex]=f; else arr.push(f); setFaults(arr); setSubScreen("faultList"); setEditIndex(null); }}
      onBack={() => { setSubScreen("faultList"); setEditIndex(null); }}/>;
  }

  if (showPDF) return <PDFPreview certData={certData} appliances={appliances} faults={faults} finalChecks={finalChecks} engineerData={engineerData} onClose={()=>setShowPDF(false)}/>;

  if (screen === "login") return <LoginScreen onUnlock={()=>setScreen("home")}/>;
  if (screen === "records") return <RecordsScreen records={records} onBack={()=>setScreen("home")} onHome={goHome}/>;

  if (screen === "home") return <HomeScreen onNew={()=>setScreen("newJob")} onRecords={()=>setScreen("records")}/>;

  if (screen === "newJob") return <NewJobScreen onBack={()=>setScreen("home")} onHome={goHome}
    onSelect={job => { if(job==="Gas Safety Certificate") { setScreen("gsc"); setSubScreen("fileRef"); } else alert(`${job} coming soon`); }}/>;

  // GSC flow
  if (screen === "gsc") {
    if (subScreen === "fileRef") return <StepFileRef data={certData} onChange={setCertData} onBack={()=>setScreen("newJob")} onHome={goHome} onNext={()=>setSubScreen("clientDetails")}/>;
    if (subScreen === "clientDetails") return <StepClientDetails data={certData} onChange={setCertData} onBack={()=>setSubScreen("fileRef")} onHome={goHome} onNext={()=>setSubScreen("applianceList")}/>;
    if (subScreen === "applianceList") return (
      <>
        <StepApplianceList appliances={appliances} onAdd={()=>{setEditIndex(null);setSubScreen("applianceForm");}} onEdit={i=>{setEditIndex(i);setSubScreen("applianceForm");}}
          onDelete={()=>setAppliances(appliances.slice(0,-1))} onNext={()=>setSubScreen("faultList")} onBack={()=>setSubScreen("clientDetails")} onHome={goHome}/>
      </>
    );
    if (subScreen === "faultList") return <StepFaultList faults={faults} onAdd={()=>{setEditIndex(null);setSubScreen("faultForm");}} onEdit={i=>{setEditIndex(i);setSubScreen("faultForm");}}
      onDelete={()=>setFaults(faults.slice(0,-1))} onNext={()=>setSubScreen("finalChecks")} onBack={()=>setSubScreen("applianceList")} onHome={goHome}/>;
    if (subScreen === "finalChecks") return <StepFinalChecks data={finalChecks} onChange={setFinalChecks} onNext={()=>setSubScreen("signature")} onBack={()=>setSubScreen("faultList")} onHome={goHome}/>;
    if (subScreen === "signature") return <StepSignature data={signatureData} onChange={setSignatureData} onNext={()=>setSubScreen("engineerDetails")} onBack={()=>setSubScreen("finalChecks")} onHome={goHome}/>;
    if (subScreen === "engineerDetails") return (
      <>
        <StepEngineerDetails data={engineerData} onChange={setEngineerData} onBack={()=>setSubScreen("signature")} onHome={goHome}
          onOptions={()=>setShowOptions(true)}/>
        {showOptions && <OptionsMenu
          onPreview={()=>{setShowOptions(false);setShowPDF(true);}}
          onSave={()=>{setRecords(r=>[...r,{certData,appliances,faults,finalChecks,signatureData,engineerData}]);setShowOptions(false);alert("Saved!");}}
          onClose={()=>setShowOptions(false)}/>}
      </>
    );
  }

  return null;
}
