import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser, Language } from '../lib/types'
import type { DemoScenario } from '../data/scenarios'

interface AppState { language:Language; setLanguage:(v:Language)=>void; theme:'light'|'dark'; toggleTheme:()=>void; user:AuthUser|null; login:(username:string,password:string)=>boolean; logout:()=>void; scenario:DemoScenario; setScenario:(value:DemoScenario)=>void; resetDemo:()=>void; setDemoRole:(role:'owner'|'staff')=>void }
const Context=createContext<AppState|null>(null)
export function AppProvider({children}:{children:ReactNode}){
  const [language,setLanguageState]=useState<Language>(()=>(localStorage.getItem('loopia-language') as Language)||'es')
  const [theme,setTheme]=useState<'light'|'dark'>(()=>(localStorage.getItem('loopia-theme') as 'light'|'dark')||'light')
  const [user,setUser]=useState<AuthUser|null>(()=>JSON.parse(sessionStorage.getItem('loopia-user')||'null'))
  const [scenario,setScenarioState]=useState<DemoScenario>(()=>(localStorage.getItem('loopia-demo-scenario') as DemoScenario)||'restaurant')
  useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark');localStorage.setItem('loopia-theme',theme)},[theme])
  useEffect(()=>{document.documentElement.lang=language;localStorage.setItem('loopia-language',language)},[language])
  const login=(username:string,password:string)=>{ if(password!=='admin'||!['admin','manager','staff'].includes(username)) return false; const next={name:username==='admin'?'María Salazar':username==='manager'?'Diego Vargas':'Personal de turno',role:username==='admin'?'owner':username as 'manager'|'staff'} satisfies AuthUser; setUser(next);sessionStorage.setItem('loopia-user',JSON.stringify(next));return true }
  const logout=()=>{setUser(null);sessionStorage.removeItem('loopia-user')}
  const setScenario=(value:DemoScenario)=>{setScenarioState(value);localStorage.setItem('loopia-demo-scenario',value)}
  const resetDemo=()=>{['loopia-demo-scenario','loopia-demo-guide','loopia-feedback','loopia-demo-requests'].forEach(key=>localStorage.removeItem(key));setScenarioState('restaurant');setLanguageState('es');setTheme('light')}
  const setDemoRole=(role:'owner'|'staff')=>{const next={name:role==='owner'?'María Salazar':'Personal de turno',role} satisfies AuthUser;setUser(next);sessionStorage.setItem('loopia-user',JSON.stringify(next))}
  return <Context.Provider value={{language,setLanguage:setLanguageState,theme,toggleTheme:()=>setTheme(v=>v==='light'?'dark':'light'),user,login,logout,scenario,setScenario,resetDemo,setDemoRole}}>{children}</Context.Provider>
}
export const useApp=()=>{const value=useContext(Context);if(!value)throw new Error('useApp must be used within AppProvider');return value}
