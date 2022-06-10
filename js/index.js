

// hero-styles
const likes = [
    "aprender cosas nuevas",
    "investigar y aplicar",
    "crear soluciones",
    "resolver problemas",
    "apoyar a mis compañeros",
    "compartir el conocimiento",
  ];

  let i = 0;
  
  const like = () => {
    if (i === likes.length - 1) {
      i = 0;
    } else {
      i++;
    }
    document.getElementById("likes").innerHTML = "y me gusta " + likes[i];
  };
  like();
  
  setInterval(() => {
    like();
  }, 1500);

  // End hero-styles

  const menu = () =>{
    console.log("Click a menu desde js")
  }


  // Para cerrar menu

  const menuLinks = document.querySelectorAll('.navBurger a[href^="#"]');

  menuLinks.forEach(link => {
    link.addEventListener("click", ()=> {
      //console.log("hiciste click en el enlace");
      document.getElementById("check").checked = true;
    })
  })