import{g as i}from"./indexedDB.094cbe96.js";import{f as o}from"./file.38dddfa9.js";const{tabs:e}=chrome||browser,c=async()=>{const t="var pdfFile = "+await i().then(r=>o(r));e.executeScript({code:t,allFrames:!0},function(){e.executeScript({allFrames:!0,file:"src/ContentScript/main.js"})})};e.onUpdated.addListener(c);
