# KippiCore Branding Lab

Laboratorio interactivo de identidad visual de KippiCore: combina tipografía × paleta × modo × atmósfera × vidrio × estático/dinámico, mide la legibilidad real y exporta tokens.

- Especificación: `docs/KippiCore_Identidad_Visual_Laboratorio.md` · Plan: `docs/PLAN.md` · Motion: `docs/MOTION.md` · Decisiones: `docs/decisiones.md`
- Stack: Vite + React + TypeScript, CSS con variables, OGL (WebGL), Canvas 2D, Vitest.

## Estado (ronda 1: etapas 1–3)
paleta Caribe eléctrico (C05), tipografía T00 (Geist), 11 atmósferas con rotación aleatoria equitativa (A01–A04, A06, A10, A11, A16, A17, A19, A20; dinámicas: A01, A10, A11, A16, A17, A19, A20), 5 vidrios (G01, G02, G05, G06, G08), medidor de legibilidad, exportar tokens CSS/JSON, vistas Combinador, Galerías y Ficha. Pendiente: G11–G20, texturas X01–X40, Matriz, Comparar, favoritos, PNG.

## Comandos
```bash
npm install
npm run dev        # desarrollo
npm test           # tests unitarios
npm run build      # build estático (dist/)
```
Atajos: `t` `c` `a` `g` (cambiar opción; mayúscula = anterior), `m` modo, `d` estático/dinámico, `?` ayuda. Toda la combinación vive en la URL.
