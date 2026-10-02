# KippiCore Branding Lab

Laboratorio interactivo de identidad visual de KippiCore: combina tipografía × paleta × modo × atmósfera × vidrio × estático/dinámico, mide la legibilidad real y exporta tokens.

- Especificación: `docs/KippiCore_Identidad_Visual_Laboratorio.md` · Plan: `docs/PLAN.md` · Motion: `docs/MOTION.md` · Decisiones: `docs/decisiones.md`
- Stack: Vite + React + TypeScript, CSS con variables, OGL (WebGL), Canvas 2D, Vitest.

## Estado (ronda 1: etapas 1–3)
22 paletas, tipografías T00–T14 (T14 = sistema KippiLex), atmósferas A01–A14 estáticas (A01, A05, A10, A11 dinámicas), vidrios G01–G10, medidor de legibilidad, exportar tokens CSS/JSON, vistas Combinador, Galerías y Ficha. Pendiente: A15–A18, G11–G20, texturas X01–X40, Matriz, Comparar, favoritos, PNG.

## Comandos
```bash
npm install
npm run dev        # desarrollo
npm test           # tests unitarios
npm run build      # build estático (dist/)
```
Atajos: `t` `c` `a` `g` (cambiar opción; mayúscula = anterior), `m` modo, `d` estático/dinámico, `?` ayuda. Toda la combinación vive en la URL.
