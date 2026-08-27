import Image from "next/image"
import { cn } from "@/lib/utils"
type LogoProps={className?:string;priority?:boolean}
export function LokiMark({className,priority=false}:LogoProps){return <Image src="/icon.svg" alt="Loki" width={180} height={180} priority={priority} className={cn("select-none object-contain",className)}/>} 
export function LokiWordmark({className,priority=false}:LogoProps){return <Image src="/loki-wordmark.svg" alt="Loki" width={215} height={48} priority={priority} className={cn("select-none object-contain",className)}/>} 
