const texta01 = document.querySelector('.text-1');
texta01.innerHTML = texta01.textContent.replace(/\S/g,"<span>$&</span>")

const texta02 = document.querySelector('.text-2');
texta02.innerHTML = texta02.textContent.replace(/\S/g,"<span>$&</span>")

let tl = gsap.timeline({repeat: -1, repeatDelay: 1, yoyo: true})
tl.to(".text-1 span", {y:  10, duration: 0, opacity:0, scale:20})
  .to(".text-1 span", {y:   0, duration: 2, opacity:1, scale:1, ease: "power3.inOut", stagger:{from: "edges", amount: 2}})
  //.to(".text-1 span", {x:-900, duration: 1, ease: "bounce.out", opacity: 0, stagger:{from: "random", amount: 1.5}})
  //.to(".text-1 span", {x: 900, duration: 1, opacity: 0})
  .to(".text-1 span", {x:   0, duration: 1, ease: "bounce.in", opacity: 1, stagger:{from: "random", amount: 1.5}});
                      
let t2 = gsap.timeline({repeat: -1, repeatDelay: 1, yoyo: true})
  t2.to(".text-2 span", {y:  10, duration: 2, opacity:0, scale:1})
    .to(".text-2 span", {y:   0, duration: 2, opacity:1, scale:1, ease: "power3.inOut", stagger:{from: "edges", amount: 2}})
    .to(".text-2 span", {x:-10, duration: 0.5, ease: "bounce.out", opacity: 0.5, rotation:"random(-30, 30)"})    
    .to(".text-2 span", {x:   0, duration: 0.5, ease: "bounce.out", opacity: 0.5, rotation:"random(-40, 40)", stagger:{from: "random", amount: 1.5}});
    
    
