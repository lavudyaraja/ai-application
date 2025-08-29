import { ThemeProvider as NextThemesProvider , ThemeProviderProps} from "next-themes"
// import { ThemeProvider, type ThemeProviderProps } from "next-themes"


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
