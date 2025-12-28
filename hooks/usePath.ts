import { useRouter, usePathname } from "expo-router";

export function usePath() {
  const router = useRouter()
  const pathname = usePathname()

  console.log('pathname', pathname)

  const handlePath = (path: string): void => {
    if (pathname === path) return
    return router.push(path)

    
  }
  return handlePath
}