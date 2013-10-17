
function klog(mess) {
   "use strict";
   if (window.console !== undefined) {
      console.log(mess);
   }
}

function kerr(mess) {
   "use strict";
   if (window.console !== undefined) {
      console.error(mess);
   }
}

function kreport(mess) {
   "use strict";
   if (window.console !== undefined) {
      console.log(mess + "");
   }
}
