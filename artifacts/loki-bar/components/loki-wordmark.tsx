import Image from "next/image"
import { cn } from "@/lib/utils"
type LogoProps={className?:string;priority?:boolean}

// The only approved Loki mark: the exact logo supplied by Roza.
// Gold is never baked into the logo; the white mark stays white and the glow is applied by CSS.
export function LokiMark({className,priority=false}:LogoProps){
  return <Image src="/loki-logo-exact.png" alt="Loki" width={192} height={192} priority={priority} className={cn("select-none object-contain loki-logo-glow",className)}/>
}

// Kept for existing layout imports, but intentionally uses the same approved logo.
export function LokiWordmark({className,priority=false}:LogoProps){
  return <Image src="/loki-logo-exact.png" alt="Loki" width={192} height={192} priority={priority} className={cn("select-none object-contain loki-logo-glow",className)}/>
}
