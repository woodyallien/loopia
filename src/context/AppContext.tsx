import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { OperationsProvider } from './OperationsContext'
import type { AuthUser, Language } from '../lib/types'
import type { DemoScenario } from '../data/scenarios'
import type { DemoView } from '../demo/types'

interface AppState { language:Language; setLanguage:(v:Language)=>void; theme:'light'|'dark'; toggleTheme:()=>void; user:AuthUser|null; login:(username:string,password:string)=>boolean; logout:()=>void; scenario:DemoScenario; setScenario:(value:DemoScenario)=>void; resetDemo:()=>void; setDemoRole:(role:'owner'|'staff')=>void; demoJourney:string|null; demoStep:number; demoView:DemoView; demoCompleted:string|null; startDemoJourney:(id:string,view?:DemoView)=>void; setDemoStep:(step:number)=>void; setDemoView:(view:DemoView)=>void; finishDemo:()=>void; exitDemo:()=>void }
const Context=createContext<AppState|null>(null)
export function AppProvider({children}:{children:ReactNode}){
  const [language,setLanguageState]=useState<Language>(()=>(localStorage.getItem('loopia-language') as Language)||'es')
  const [theme,setTheme]=useState<'light'|'dark'>(()=>(localStorage.getItem('loopia-theme') as 'light'|'dark')||'light')
  const [user,setUser]=useState<AuthUser|null>(()=>JSON.parse(sessionStorage.getItem('loopia-user')||'null'))
  const [scenario,setScenarioState]=useState<DemoScenario>(()=>(localStorage.getItem('loopia-demo-scenario') as DemoScenario)||'restaurant')
  const [demoJourney,setDemoJourney]=useState<string|null>(null),[demoStep,setDemoStep]=useState(0),[demoView,setDemoView]=useState<DemoView>('presenter'),[demoCompleted,setDemoCompleted]=useState<string|null>(null)
  useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark');localStorage.setItem('loopia-theme',theme)},[theme])
  useEffect(()=>{document.documentElement.lang=language;localStorage.setItem('loopia-language',language)},[language])
  const login=(username:string,password:string)=>{ if(password!=='admin'||!['admin','manager','staff'].includes(username)) return false; const next={name:username==='admin'?'María Salazar':username==='manager'?'Diego Vargas':'Personal de turno',role:username==='admin'?'owner':username as 'manager'|'staff'} satisfies AuthUser; setUser(next);sessionStorage.setItem('loopia-user',JSON.stringify(next));return true }
  const logout=()=>{setUser(null);sessionStorage.removeItem('loopia-user')}
  const setScenario=(value:DemoScenario)=>{setScenarioState(value);localStorage.setItem('loopia-demo-scenario',value)}
  const resetDemo=()=>{['loopia-demo-scenario','loopia-demo-guide','loopia-feedback','loopia-demo-requests','loopia-demo-analytics','loopia-operations','loopia-portal-customer','loopia-scan-code'].forEach(key=>localStorage.removeItem(key));window.dispatchEvent(new Event('loopia-reset'));setScenarioState('restaurant');setLanguageState('es');setTheme('light');setDemoJourney(null);setDemoStep(0);setDemoCompleted(null)}
  const setDemoRole=(role:'owner'|'staff')=>{const next={name:role==='owner'?'María Salazar':'Personal de turno',role} satisfies AuthUser;setUser(next);sessionStorage.setItem('loopia-user',JSON.stringify(next))}
  const startDemoJourney=(id:string,view:DemoView='presenter')=>{setDemoJourney(id);setDemoStep(0);setDemoView(view);setDemoCompleted(null);const key='loopia-demo-analytics';const entries=JSON.parse(localStorage.getItem(key)||'[]');localStorage.setItem(key,JSON.stringify([...entries,{event:'journey_started',journey:id,scenario,view,at:new Date().toISOString()}]))}
  const finishDemo=()=>{if(demoJourney){const key='loopia-demo-analytics';const entries=JSON.parse(localStorage.getItem(key)||'[]');localStorage.setItem(key,JSON.stringify([...entries,{event:'journey_completed',journey:demoJourney,scenario,view:demoView,at:new Date().toISOString()}]))}setDemoCompleted(demoJourney);setDemoJourney(null)}
  const exitDemo=()=>{if(demoJourney){const key='loopia-demo-analytics';const entries=JSON.parse(localStorage.getItem(key)||'[]');localStorage.setItem(key,JSON.stringify([...entries,{event:'journey_exited',journey:demoJourney,step:demoStep,scenario,view:demoView,at:new Date().toISOString()}]))}setDemoJourney(null);setDemoCompleted(null);setDemoStep(0)}
  return <Context.Provider value={{language,setLanguage:setLanguageState,theme,toggleTheme:()=>setTheme(v=>v==='light'?'dark':'light'),user,login,logout,scenario,setScenario,resetDemo,setDemoRole,demoJourney,demoStep,demoView,demoCompleted,startDemoJourney,setDemoStep,setDemoView,finishDemo,exitDemo}}><OperationsProvider>{children}</OperationsProvider></Context.Provider>
}
export const useApp=()=>{const value=useContext(Context);if(!value)throw new Error('useApp must be used within AppProvider');return value}
