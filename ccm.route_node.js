/* 
 * The MIT License
 *
 * Copyright 2017 Moritz Kemp <moritz at kemp-thelen.de>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function(){
    var component = {
        name: 'route_node',
        ccm: 'https://akless.github.io/ccm/ccm.js',
        config: {
            'patterns': [],
            'nextNodes': [],
            'prevNode': {'route':'', 'node': ''},
            'observer': [],
            'isRoot': false
        },
        Instance: function(){
            let my = {};
            const self = this;
           
            this.start = function( callback ){
                my = self.ccm.helper.privatize(self);
                if(my.isRoot){
                    window.onpopstate = onURLChange;
                }
                if(my.prevNode.node)
                    my.prevNode.node.addNextNode(self);
                if(callback) callback();
            };
            
            /* public interface primary for location and node components */
            this.getPatterns = function(){
                return my.patterns;
            };
            this.setPatterns = function( patterns ){
                my.patterns = patterns;
            };
            this.getPrevNode = function(){
                return my.prevNode;
            };
            this.setPrevNode = function( prev ){
                my.prevNode = prev;
                if(my.prevNode.node)
                    my.prevNode.node.addNextNode(self);
            };
            this.addNextNode = function( next ){
                my.nextNodes.push(next);
            };
            this.getNextNodes = function(){
                return my.nextNodes;
            };
            this.notify = function( match, subroute ){
                notifyObserver(match);
                notifyNextNodes(subroute);
            };
            
            /* public interface primary for navigation components */
            this.navigatedTo = function( route ){
                if(!my.isRoot && my.prevNode.node){
                    my.prevNode.node.navigatedTo( my.prevNode.route + route);
                } else if(my.isRoot){
                    applyURLChange(route);
                }
            };
            
            this.addObserver = function( handlerFunction ){
                if( typeof(handlerFunction) === 'function')
                    my.observer.push(handlerFunction);
            };
            
            this.checkURL = function(){
                if(my.isRoot)
                    onURLChange();
                else if(my.prevNode.node)
                    my.prevNode.node.checkURL();
            };
            
            /* private functions */
            const notifyObserver = function( route ){
                my.observer.forEach( (observer)=>{
                    observer( route );
                });
            };
            
            const notifyNextNodes = function( route ){
                my.nextNodes.forEach( (nextNode)=>{
                    let result = getMatch(route, nextNode.getPatterns() );
                    if(result){
                        // first param is matching string, 
                        // second param the tail string of the route
                        nextNode.notify(result[1], result[2]);
                    }
                });
            };
            
            const getMatch = function( route, patterns ){
                let result;
                let i = 0;
                while(!result && i < patterns.length){
                    // Credit to https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex/6969486#6969486
                    let escapedPattern = patterns[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                    let regex = new RegExp("("+escapedPattern+")(\/*.*)", "g");
                    result = regex.exec(route);
                    i++;
                };
                return result;
            };
            
            const onURLChange = function(){
                if(location.hash.length > 0){
                    let route = location.hash.replace('#', '');
                    let result = getMatch(route, my.patterns);
                    if(result){
                        self.notify(result[1], result[2]);
                    }
                }
            };
            
            const applyURLChange = function( route ){
                window.history.pushState({}, '', '#'+route);
            };
        } 
        
    };
    
    
    //The following code gets the framework and registers component from above
    function p(){window.ccm[v].component(component);}
    var f="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[f])window.ccm.files[f]=component;else{var n=window.ccm&&window.ccm.components[component.name];n&&n.ccm&&(component.ccm=n.ccm),"string"==typeof component.ccm&&(component.ccm={url:component.ccm});var v=component.ccm.url.split("/").pop().split("-");if(v.length>1?(v=v[1].split("."),v.pop(),"min"===v[v.length-1]&&v.pop(),v=v.join(".")):v="latest",window.ccm&&window.ccm[v])p();else{var e=document.createElement("script");document.head.appendChild(e),component.ccm.integrity&&e.setAttribute("integrity",component.ccm.integrity),component.ccm.crossorigin&&e.setAttribute("crossorigin",component.ccm.crossorigin),e.onload=function(){p(),document.head.removeChild(e)},e.src=component.ccm.url}} 
}());

