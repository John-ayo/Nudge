import { useState } from "react";


const MenuIcon     = () => (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const UploadIcon   = () => (<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const DownloadIcon = () => (<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const CheckIcon    = () => (<svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>);

const ACCENT_COLORS = ["#6C63FF","#EF4444","#10B981","#F59E0B","#06B6D4","#F97316","#EC4899","#8B5CF6"];

function Toggle({ on, onChange }) {
  return (
    <button onClick={()=>onChange(!on)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
      style={{ backgroundColor:on?"#6C63FF":"#2a2a2a" }}>
      <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
        style={{ left:on?"calc(100% - 22px)":"2px" }}/>
    </button>
  );
}

function Section({ title, sub, children }) {
  return (
    <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
      <h3 className="text-white font-bold text-base mb-0.5" style={{ fontFamily:"'Syne',sans-serif" }}>{title}</h3>
      {sub && <p className="text-gray-500 text-xs mb-5">{sub}</p>}
      {!sub && <div className="mb-4"/>}
      {children}
    </div>
  );
}

function NotifRow({ label, sub, on, onChange }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid #1f1f1f" }}>
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-gray-500 text-xs">{sub}</p>
      </div>
      <Toggle on={on} onChange={onChange}/>
    </div>
  );
}

export default function SettingsPage({ onMenuOpen, user }) {


  const [displayName, setDisplayName] = useState(user?.name ?? "Johnpaul3.0");
  const [email,       setEmail]       = useState("johnpaul@email.com");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [notifs, setNotifs] = useState({
    dailyReminder:  true,
    streakAlert:    true,
    dueDateWarning: true,
    weeklyPride:    false,
    celebrationSfx: true,
  });
  const [reminderTime, setReminderTime] = useState("08:00");

  const [accent,     setAccent]     = useState("#6C63FF");
  const [dailyGoal,  setDailyGoal]  = useState(8);
  const [focusTimer, setFocusTimer] = useState("25m");

  const toggleNotif = key => setNotifs(prev=>({...prev,[key]:!prev[key]}));

  const inputStyle = {
    backgroundColor:"#111", border:"1px solid #2a2a2a", color:"#fff",
    borderRadius:"12px", padding:"10px 14px", fontSize:"14px", outline:"none", width:"100%",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor:"#0a0a0a", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}input[type=time]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:0.4;}`}</style>



      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-5 lg:px-8 py-5"
        style={{ backgroundColor:"#0a0a0a", borderBottom:"1px solid #141414" }}>
        <button onClick={()=>{ onMenuOpen?.(); }} className="lg:hidden text-gray-400 hover:text-white transition-colors"><MenuIcon/></button>
        <div>
          <p className="text-gray-500 text-xs tracking-widest font-medium">PREFERENCES</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily:"'Syne',sans-serif" }}>Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 lg:px-8 py-6 max-w-2xl w-full">

        {/* Account */}
        <Section title="Account">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0" style={{ backgroundColor:"#6C63FF" }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white transition-all hover:bg-[#2a2a2a]"
                style={{ backgroundColor:"#1f1f1f", border:"1px solid #2a2a2a" }}>
                <UploadIcon/> Change Photo
              </button>
              <p className="text-gray-600 text-xs mt-1">JPG, PNG up to 2MB</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">DISPLAY NAME</label>
              <input value={displayName} onChange={e=>setDisplayName(e.target.value)} style={inputStyle}
                onFocus={e=>e.target.style.borderColor="#6C63FF"} onBlur={e=>e.target.style.borderColor="#2a2a2a"}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">EMAIL</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle}
                onFocus={e=>e.target.style.borderColor="#6C63FF"} onBlur={e=>e.target.style.borderColor="#2a2a2a"}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">NEW PASSWORD</label>
              <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)}
                placeholder="Leave blank to keep current" style={inputStyle}
                onFocus={e=>e.target.style.borderColor="#6C63FF"} onBlur={e=>e.target.style.borderColor="#2a2a2a"}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">CONFIRM PASSWORD</label>
              <input type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)}
                placeholder="password" style={inputStyle}
                onFocus={e=>e.target.style.borderColor="#6C63FF"} onBlur={e=>e.target.style.borderColor="#2a2a2a"}/>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" sub="Control how and when Nudge reaches you">
          <div className="-mt-2">
            <NotifRow label="Daily task reminder"       sub="Get nudged each morning to set your tasks"  on={notifs.dailyReminder}   onChange={()=>toggleNotif("dailyReminder")}/>
            <NotifRow label="Streak alert"              sub="Know when your streak is at risk"           on={notifs.streakAlert}     onChange={()=>toggleNotif("streakAlert")}/>
            <NotifRow label="Due date warning"          sub="Get warned 1 hour before a task is due"     on={notifs.dueDateWarning}  onChange={()=>toggleNotif("dueDateWarning")}/>
            <NotifRow label="Weekly pride report"       sub="A summary of everything you crushed"        on={notifs.weeklyPride}     onChange={()=>toggleNotif("weeklyPride")}/>
            <NotifRow label="Celebration sound effects" sub="Play sounds when you complete tasks"        on={notifs.celebrationSfx}  onChange={()=>toggleNotif("celebrationSfx")}/>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-gray-400 text-sm">Reminder time:</span>
            <input type="time" value={reminderTime} onChange={e=>setReminderTime(e.target.value)}
              className="rounded-xl px-3 py-1.5 text-sm text-white outline-none"
              style={{ backgroundColor:"#111", border:"1px solid #2a2a2a" }}
              onFocus={e=>e.target.style.borderColor="#6C63FF"} onBlur={e=>e.target.style.borderColor="#2a2a2a"}/>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" sub="Make Nudge feel like yours">
          <div className="flex items-center justify-between py-3 mb-4" style={{ borderBottom:"1px solid #1f1f1f" }}>
            <div>
              <p className="text-white text-sm font-medium">Theme</p>
              <p className="text-gray-500 text-xs">Dark mode is always on. Light mode coming soon.</p>
            </div>
            <span className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor:"#2a2a2a" }}>Dark</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-0.5">Accent Colour</p>
            <p className="text-gray-500 text-xs mb-3">Changes buttons, highlights and active states</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map(c=>(
                <button key={c} onClick={()=>setAccent(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor:c, border:accent===c?"2.5px solid #fff":"2.5px solid transparent", transform:accent===c?"scale(1.15)":"scale(1)" }}>
                  {accent===c&&<CheckIcon/>}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Productivity */}
        <Section title="Productivity" sub="Tune Nudge to match how you actually work">
          <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid #1f1f1f" }}>
            <div>
              <p className="text-white text-sm font-medium">Daily task goal</p>
              <p className="text-gray-500 text-xs">How many tasks you aim to complete each day</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setDailyGoal(g=>Math.max(1,g-1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-lg font-bold transition-all hover:bg-[#2a2a2a]"
                style={{ backgroundColor:"#1f1f1f", border:"1px solid #2a2a2a" }}>-</button>
              <span className="text-white font-bold w-6 text-center">{dailyGoal}</span>
              <button onClick={()=>setDailyGoal(g=>g+1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-lg font-bold transition-all hover:bg-[#2a2a2a]"
                style={{ backgroundColor:"#1f1f1f", border:"1px solid #2a2a2a" }}>+</button>
            </div>
          </div>
          <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid #1f1f1f" }}>
            <div>
              <p className="text-white text-sm font-medium">Default focus timer</p>
              <p className="text-gray-500 text-xs">Default duration when you start focus mode</p>
            </div>
            <div className="flex gap-1.5">
              {["15m","25m","45m","60m"].map(t=>(
                <button key={t} onClick={()=>setFocusTimer(t)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ backgroundColor:focusTimer===t?"#6C63FF":"#1f1f1f", color:focusTimer===t?"#fff":"#9CA3AF", border:`1px solid ${focusTimer===t?"#6C63FF":"#2a2a2a"}` }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-white text-sm font-medium">XP per task</p>
              <p className="text-gray-500 text-xs">Short tasks earn 50 XP, longer tasks earn 75 XP</p>
            </div>
            <span className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor:"#6C63FF" }}>Auto</span>
          </div>
        </Section>

        {/* Privacy */}
        <Section title="Privacy and Data" sub="Your data, your control">
          <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid #1f1f1f" }}>
            <div>
              <p className="text-white text-sm font-medium">Export my data</p>
              <p className="text-gray-500 text-xs">Download all your tasks and history as a CSV file</p>
            </div>
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white transition-all hover:opacity-80"
              style={{ backgroundColor:"#1f1f1f", border:"1px solid #2a2a2a" }}>
              <DownloadIcon/> Export CSV
            </button>
          </div>
          <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid #1f1f1f" }}>
            <div>
              <p className="text-white text-sm font-medium">Clear all tasks</p>
              <p className="text-gray-500 text-xs">Permanently delete all tasks. This cannot be undone.</p>
            </div>
            <button className="rounded-xl px-3 py-2 text-sm font-medium transition-all hover:opacity-80"
              style={{ backgroundColor:"#2d0f0f", border:"1px solid #7f1d1d", color:"#f87171" }}>
              Clear Tasks
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium" style={{ color:"#EF4444" }}>Delete account</p>
              <p className="text-gray-500 text-xs">Permanently remove your account and all data</p>
            </div>
            <button className="rounded-xl px-3 py-2 text-sm font-medium transition-all hover:opacity-80"
              style={{ backgroundColor:"#2d0f0f", border:"1px solid #7f1d1d", color:"#f87171" }}>
              Delete Account
            </button>
          </div>
        </Section>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button className="rounded-2xl px-5 py-2.5 text-sm font-medium text-gray-400 transition-all hover:text-white"
            style={{ backgroundColor:"transparent", border:"1px solid #2a2a2a" }}>
            Reset to defaults
          </button>
          <button className="rounded-2xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor:"#6C63FF" }}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}