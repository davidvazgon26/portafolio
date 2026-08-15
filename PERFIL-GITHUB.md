# README para el perfil de GitHub

> **Este archivo NO se publica con el portafolio.** Es el contenido propuesto para el README del
> perfil, que vive en un repositorio aparte llamado `davidvazgon26` (mismo nombre que el usuario).
>
> Para aplicarlo: entrar a ese repo → editar `README.md` → pegar lo que sigue.

## 🔴 NO PUBLICAR TODAVÍA — está listo y aprobado, pero en pausa

**El texto está terminado y a dvazquez le parece bien. El bloqueo no es de contenido ni
de código.**

El 15-ago-2026 se publicó y se revirtió el mismo día (commits `57b425b` y `d70c021` del
repo del perfil). El perfil sigue mostrando el README de 2022.

**El motivo es personal y ajeno al proyecto.** Dvazquez tiene una razón para no tocar
todavía su portada de GitHub que no tiene que ver con el desarrollo y que no se documentó
aquí. **No hace falta conocerla para respetarla: hasta que él diga que sí, esto no se
publica**, aunque todo lo demás esté resuelto.

⚠️ **No confundir con el problema de Vercel** que está más abajo. Son dos asuntos
independientes: aquel es un bug real que conviene arreglar por su cuenta, pero **arreglarlo
NO desbloquea esta publicación**. La única condición aquí es que dvazquez lo autorice.

### Cómo publicarlo cuando toque

Desde `Personal/Portafolio/`, con `gh` autenticado:

```powershell
node previsualizar-perfil.mjs      # revisar antes
start vista-previa-perfil.html
```

Y después, a mano en `github.com/davidvazgon26/davidvazgon26` → editar `README.md` → pegar
el bloque de abajo. **Que lo haga dvazquez, no Claude.**

---

## ⚠️ Aparte: el despliegue del portafolio está roto

**Problema independiente del bloqueo de arriba.** Vale la pena arreglarlo por sí mismo —el
portafolio está enlazado desde LinkedIn y desde el README actual—, pero resolverlo no
habilita la publicación del perfil.

Diagnóstico del 15-ago-2026:

| | |
|---|---|
| GitHub | ✅ Correcto. Rama `main`, `main` es la rama por defecto, todos los commits subidos |
| Sitio en vivo | ❌ Versión anterior a julio: carga `particles.min.js` y usa el título viejo |
| Peso servido | 13 KB contra 29.5 KB del `index.html` local |

**Hipótesis principal:** en Vercel, la *Production Branch* del proyecto dice `master` y el
repo solo tiene `main`, así que ningún push dispara despliegue y el sitio quedó congelado
en el último que sí vino de `master`. Encaja con que los 4 commits de julio nunca se
vieran publicados.

**Qué revisar** en vercel.com → proyecto del portafolio → Settings → Git:
1. ¿A qué repositorio está conectado? Debe ser `davidvazgon26/portafolio`.
2. **Production Branch** → si dice `master`, cambiar a `main`.
3. Deployments → si el último es de julio o antes, confirma que no se dispara nada.
4. Forzar un **Redeploy** con la rama ya corregida.

Si nunca estuvo conectado, reimportar el repo y borrar el proyecto viejo — **conservando
el dominio `portafoliodavid-zeta.vercel.app`**, que es el que está enlazado desde todos
lados.

---

## Contenido propuesto

```markdown
## Hola, soy David 👋

Desarrollador de software full-stack en el sector transporte y logística, en México.

Mi trabajo no es empezar proyectos desde cero: es entrar a sistemas que llevan años —a veces
décadas— en producción, entender por qué están hechos como están, y cambiarlos sin romper lo
que la operación necesita todos los días.

También tomo proyectos completos por mi cuenta: de la primera conversación al sitio
desplegado — diseño, frontend, backend, despliegue y la documentación para que otro pueda
mantenerlo. Uso herramientas de IA en ese proceso y me permiten cubrir todo ese rango solo.
Lo que no delego es el criterio: qué se construye, qué se deja fuera y qué se le promete a
quien lo va a usar.

- 🔧 Trabajo a diario con **C#, .NET, ASP.NET Web API, SQL Server y Angular**
- 🏗️ Me especializo en **mantener y modernizar sistemas heredados**
- 📊 Llegué al desarrollo desde el análisis de datos, y eso me marcó: antes de proponer una
  solución, quiero ver los datos que la justifican
- 🌱 Practicando fundamentos y mejorando mi inglés técnico
- 📫 [LinkedIn](https://www.linkedin.com/in/davidvazgon/) ·
  [Portafolio](https://portafoliodavid-zeta.vercel.app)

### Stack

**Día a día**
![C#](https://img.shields.io/badge/C%23-239120?style=flat&logo=csharp&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-512BD4?style=flat&logo=dotnet&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=flat&logo=microsoftsqlserver&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

**También**
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=flat&logo=powerbi&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)
```

---

## Qué cambia respecto al README actual

| Antes | Ahora | Por qué |
|---|---|---|
| "A passionate full stack developer from México" | Descripción de qué haces realmente | La frase anterior es de plantilla y no dice nada. |
| Stack: JS, React, Node, Express, PostgreSQL, MySQL | **C#, .NET, SQL Server, Angular** primero | Lo que usas a diario debe ir primero. |
| "Currently working on My Ticket" | Trabajo actual real | "My Ticket" es de 2022; presentarlo como actual desactualiza el perfil. |
| Proyectos destacados: Pokémon, comida | Enlaces a LinkedIn y portafolio | Los proyectos de práctica van en el portafolio, no en la portada. |
| Soft skills genéricas | Cómo trabajas, concreto | "Trabajo en equipo, creatividad y compromiso" lo escribe todo el mundo. |
| — | Párrafo de proyectos por cuenta propia | Abre la puerta a trabajo independiente y dice que puedes entregar solo un proyecto entero. |

### Sobre mencionar la IA

Se decidió **poner el alcance primero y la IA como método**, no al revés. El motivo: anunciar
"trabajo con IA" en primer plano corta para los dos lados — a un cliente le suena a eficiencia,
pero a cierto reclutador técnico le suena a dependencia. Lo que no tiene ese riesgo es el
alcance: que tomas un proyecto entero tú solo.

La frase de cierre ("lo que no delego es el criterio") es la que hace el trabajo: separa a
quien dirige el desarrollo de quien solo lo despacha. Si algún día suena a demasiado, es la
última que se quita, no la primera.

**Se decidió NO incluir enlace a un proyecto como evidencia** — el portafolio ya está enlazado
arriba y ahí está el trabajo.

---

## Repos fijados — propuesta

Los fijados son lo primero que se ve. Hoy son 6, y 4 son ejercicios de práctica.

### Quitar

| Repo | Por qué |
|---|---|
| `JuegoDeMemoria` | Ejercicio de práctica. |
| `TicTacToe` | Ejercicio de práctica; además es el más común en portafolios junior. |
| `appClima` | App de clima con API — el proyecto más repetido que existe. |

### Conservar

| Repo | Por qué |
|---|---|
| `CapturaValidaHuella` | **Integración con hardware biométrico.** Problema real, poco común. |
| `xml-downloader` | **Integración con servicios del SAT.** Dominio fiscal, SOAP y firma digital. |
| `portafolio` | Muestra criterio de frontend y ahora está actualizado. |

### Para llenar los 3 huecos

Ordenados por prioridad:

1. **Cualquier repo tuyo con C#/.NET que no esté fijado.** Revisa los 79 — es probable que
   haya algo mejor que un juego de memoria.
2. **`MisProyectosPython` o similar**, si tienes scripts de automatización presentables. La
   automatización real vende más que un CRUD de práctica.
3. **`My Ticket`**, único proyecto en equipo — demuestra colaboración, que ninguno de los otros
   muestra. Nota: el repo es de otra persona; se puede fijar solo si lo tienes forkeado.

**Si no encuentras 3 buenos, deja 4 fijados.** Cuatro repos sólidos comunican mejor que seis
donde dos son de relleno.

### Cómo se hace

Perfil → botón **"Customize your pins"** → seleccionar hasta 6 → Save. Es solo criterio, no
requiere código.

---

## Limpieza de los 79 repos

Pendiente, y el menos urgente. La idea: pasar a privados o archivar los ejercicios de curso que
no aportan. Conviene hacerlo con calma y **repo por repo**, no en masa.

Criterio sugerido:

- **Conservar público:** cualquier cosa con código propio no trivial, aunque sea vieja.
- **Archivar:** proyectos terminados que ya no vas a tocar pero que muestran trabajo. Quedan
  visibles y marcados como archivados — es honesto, no los borra.
- **Privado:** clones de tutorial, ejercicios de clase, repos vacíos o con un solo commit.

Ojo: **archivar es reversible; borrar no.** Ante la duda, archiva.
