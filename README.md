# The routing component

## Overview
This is a ccm component.
The routing-node helps you to add unique URL's to
your Single-Page-Application.

Routing of a ccm web application is accomplished with multiple
instances of routing-nodes. A single routing-node, if notified, 
is responsible to inform all his observers about the
current url change and to notify attached routing-nodes.

Each routing-node holds an array of patterns. These are used
to decide if this routing-node should be notified upon a URL change.

## Goals
- provide a way to accomplish routing in SPA's build by ccm components
- allow encapsulation to hide component specific routing

## Example
For example:
If your app's server is myserver.org and on your landing page, you
have a navigation, to two sites, one page for recent news and one 
page for a chat. Because its a SPA, all pages have the same URL of 
myserver.org .

Now you want the news-Page to be displayed as myserver.org#/news.
(the hashtag is currently mandatory) and the chat-page as 
myserver.org#/chat.

We create 3 instances of the routing-node:
- one instance as the root. This instance has a callback on 
  window.onpopstate.
- one instance for the news page. Because the news-page 
  has "/news" as his route, we configure this as the routing-node's
  pattern: "config":{"patterns":["/news"]}. The consequence is that 
  this routing-node is only specified if the URL (after the hash) 
  matches "/news" somewhere.
- one instance for the chat page. Same like for the news page: we want this
  routing-node only be notified if "/chat" appears in the URL, thus
  configuration is: `"config":{"patterns":["/chat"]}`

But currently, these routing-nodes are not attached together. We
can change this by either configure the previous and next routing-nodes
at start via config, or calling the addNextNode( node ) and setPrevNode( node )
methods.

We use the config approach in the following code example:

```javascript

renderNews( route ){
  //do stuff	
};

renderChat( route ){
  //do more stuff
};

ccm.start(
  'moritzkemp.github.io/ccm-route_node/ccm.route_node.js',
  {
    "isRoot": true
  },
  (root_route)=>{
		
    ccm.start(
      'moritzkemp.github.io/ccm-route_node/ccm.route_node.js',
      {
        "patterns": ["/news"],
        "prevNode": {
          "route": "",
          "node": root_route 
        },
        "observer": [renderNews]
      }
    );

    ccm.start(
      'moritzkemp.github.io/ccm-route_node/ccm.route_node.js',
      {
        "patterns": ["/chat"],
        "prevNode": {
          "route": "",
          "node": root_route
        },
        "observer":[renderChat]
      }
    );
  }
);

```

You may be wonder why there is no attachement from the root routing-node
to the news or chat root node. This is done by the component itself 
as soon as you set the previous node either via config or `setPrevNode`.

## API

### Properties
* `patterns`: array of strings. Routing-nodes are only notified by 
  a URL change if any of these strings match the beginnig of the route.

* `nextNodes`: array of routing nodes. These nodes are potentially
  notified on an URL change depending on their patterns.

* `prevNodes`: object with properties `route` and `node` representing
  the precessor of the route. `prevNode.route` ist a string matching
  one of the precessor routing node patterns. `prevNode.node` is a 
  reference to the precessor node.

* `observer`: array of functions. These functions get called every time
  the routing-node gets notified. If the function accepts a parameter,
  the pattern which caused this route-node to be notified is given as
  a string. More observer function can be added by the 
  `addObserver( func ) ` method.

* `isRoot`: boolean, default is false. If true, this route-node will
  register his own function on the `window.popstate` event. Also takes
  different action on a `navigatedTo` method call by changing the 
  browsers history (current origin) via `window.history.pushState`.

### Methods

* `getPatterns()`: returns `patterns`.
* `setPatterns( patterns )`: set `patterns`. Be carefull of inconsistence,
  because there may be next routing nodes which have old patterns
  on their `prevNode.route`.
* `getPrevNode()`: returns `prevNode`.
* `setPrevNode( object )`: param with format `{"route":"...", "node": nodeRef}`. Sets a new `prevNode`.
* `addNextNode( next )`: param with reference to a routing-node. Adds this
  routing-node to the `nextNodes` array.
* `getNextNodes()`: return `nextNodes`.
* `notify( match, subroute )`: params `match` is a string matching one of
  the strings in `patterns` and `subroute` is the string representing the 
  route after `match`. Notifies all registered observers with `match` as
  parameter and notifies next routing-nodes if they have a pattern that
  matches the beginning of `subroute`.
* `navigatedTo( route )`: param `route` is a string, typically matching
  one of the strings in `patterns`, but don't have to. Calls 
  `prevNode.node.navigatedTo( prevNode.route + route )` if `isRoot` is 
  false. If true, then `route` is displayed as the new location.
* `addObserver( func )`: param is a function ref. Given function is called
  every time this routing-node is notified.




