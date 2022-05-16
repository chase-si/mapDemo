import React, { useState, useEffect } from 'react'
import './App.css';

import DrawNet from './pages/drawNet';
import DlDrawNet from './pages/olDrawNet';
import Analysis from './pages/analysis';
import CrossPoint from './pages/crossPoint';

const routers = [{
	path: '/drawnet',
  	component:<>
	         <DrawNet />
	         <DlDrawNet />
	         </>
}, {
  	path: '/analysis',
  	component: <Analysis />
}, {
	path: '/crossPoint',
	component: <CrossPoint />
}]


function App() {
	const [currentRouter, setCurrent] = useState(null)

	useEffect(() => {
		if (window.location.pathname) {
			const tarPage = routers.find(item => item.path === window.location.pathname)
			if (tarPage) {
				setCurrent(tarPage.component)
			}
		}
	} , [window?.location?.pathname])

  	return (
    	<div className="App">
			<div className="nav">
				{routers.map(router => (
					<a key={router.path} href={router.path}>
						{router.path}
					</a>
				))}
			</div>

			<div className="body">
				{currentRouter}
			</div>
    	</div>
  	);
}

export default App;
