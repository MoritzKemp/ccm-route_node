This is a ccm component.
The routing-node helps you to add unique URL's to
your Single-Page-Application.

Routing of a ccm web application is accomplished with multiple
instances of routing-nodes. A single routing-node, if notified, 
is responsible to inform all his observers about the
current url change and to notify attached routing-nodes.

Each routing-node holds an array of patterns. These are used
to decide if this routing-node should be notified upon a URL change.

For example:
If your app's server is myserver.org and on your alnding page, you
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

We will use both in the following code example:

```

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
)

```

You may be wonder why there is no attachement from the root routing-node
to the news or chat root node. This is done by the component itself 
as soon as you set the previous node either via config or `setPrevNode`.
