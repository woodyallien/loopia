import { Link } from 'react-router-dom'
import { brand } from '../config/brand'
export function Logo({light=false,compact=false}:{light?:boolean;compact?:boolean}){return <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg"><span className="relative grid size-9 place-items-center rounded-xl bg-gold text-lg font-black text-ink">L<span className="absolute right-1 top-1 size-1.5 rounded-full bg-white"/></span>{!compact&&<span className={`text-xl font-bold tracking-tight ${light?'text-white':''}`}>{brand.name}</span>}</Link>}
