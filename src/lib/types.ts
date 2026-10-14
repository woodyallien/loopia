export type Language = 'es' | 'en'
export type Role = 'owner' | 'manager' | 'staff'
export type Tier = 'Explorador' | 'Viajero' | 'Frecuente' | 'Insider' | 'VIP'
export interface Customer { id:string; name:string; initials:string; country:string; language:'ES'|'EN'; visits:number; spend:number; points:number; tier:Tier; lastVisit:string; referrals:number; status:'Nuevo'|'Frecuente'|'VIP'|'Activo'|'En riesgo'|'Inactivo'; phone:string; email:string; city:string; joined:string; birthday?:string }
export interface Reward { id:string; name:string; description:string; points:number; type:string; tier?:Tier; active:boolean; claimed?:boolean }
export interface Campaign { id:string; name:string; channel:'WhatsApp'|'Email'|'SMS'; audience:string; status:'Borrador'|'Programada'|'Enviada'|'Completada'; sent:number; returned:number; revenue:number; recipientIds?:string[]; sentAt?:string; message?:string }
export interface AuthUser { name:string; role:Role }
