{/* <main className="main">
					<div style={{ height: 300 }}>
						<VTree
							dataSetting={treeDataSetting}
							data={__mockData}
						/>
					</div>
        </main>  */}
        
        // const treeDataSetting = {
	// 	dataKey: 'id',
	// 	dataViewKey: 'resource_name',
	// 	childArrayKey: 'child',
	// 	// needLoadData: (node) => {
	// 	// 	if (node.id === 45) {
	// 	// 		return true;
	// 	// 	}
	// 	// 	return false;
	// 	// },
	// 	// loadData: () => new Promise((resolve) => {
	// 	// 	setTimeout(() => {
	// 	// 		const arr = [];
	// 	// 		const gaps = 120000;
	// 	// 		for (let i = gaps; i < gaps + 3000; i++) {
	// 	// 			arr.push({ id: i, resource_name: `异步测试${i}`, child: [{ id: i + 100000, resource_name: `异步测试${i + 100000}` }] });
	// 	// 		}
	// 	// 		resolve({ isSuccess: true, data: arr });
	// 	// 	}, 1000);
	// 	// })
	// }

	// const mockData = () => {
	// 	const arr = [];
	// 	const baseGap = 10000;
	// 	for (let i = 1; i < baseGap; i++) {
	// 		arr.push({
	// 			id: i, resource_name: `异步测试${i}`, child: [
	// 				{ id: i + baseGap, resource_name: `异步测试${i + baseGap}` },
	// 				{ id: i + baseGap * 2, resource_name: `异步测试${i + baseGap * 2}`, }
	// 			]
	// 		});
	// 	}
	// 	return [{ id: 0, resource_name: '根', child: arr }]
	// };

	// const __mockData = mockData()