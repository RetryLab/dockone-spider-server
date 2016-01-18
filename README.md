# dockerone-crawler-server

## UI API

account 用户信息

```

PUT		/user/account 				// 注册账户
			--body
				name: 用户名
				email: 邮箱
				password: 密码

POST 	/user/account 				// 用户登录
			--body
				email: 邮箱
				password: 密码

```

machine 用户机器配置

```

POST 	/user/machine 				// 创建一个机器信息
			--body
				name: 名字
				description: 描述
				os: 系统
				os_version: 系统版本
				cpu_num: 处理器核数 int/单位
				mem_size: 内存大小 g/单位
				disk_size: 硬盘大小 g/单位
				transport_size: 发送字节大小(下行) byte/单位
				receive_size: 接收字节大小(上行) byte/单位

GET 	/user/machines 				//获取当前用户所有的机器信息
			--response[]
				_id: 机器id
				account_id: 用户ID
				name: 名字
				description: 描述

GET 	/user/machine/:id 			// 获取一个机器信息
			--params
				id: 机器ID
			--response
				_id: 机器id
				account_id: 用户ID
				name: 名字
				description: 描述

PUT 	/user/machine/:id 			// 修改一个机器信息
			--params
				id: 机器ID
			--body
				* 参考 POST /user/machine

DELETE 	/user/machine/:id 			// 删除一个机器信息
			--params
				id: 机器ID

```

profile docker配置

```

POST 	/user/profile 				// 创建一个配置信息
			--body
				machine_id: 机器ID
				name: 名字
				description: 描述
				cpu_use: 使用处理器占比 0~1
				cpu_num_use: 使用处理器核数 1,2,3..
				mem_use: 使用内存占比 0~1
				disk_use: 使用硬盘占比 0~1
				transport_use: 上行带宽占比 0~1
				receive_use: 下行带宽占比 0~1

GET 	/user/profiles/:machine_id 	//获取当前用户某个机器上的所有配置信息
			--params
				machine_id: 机器ID
			--response[]
				_id: 配置id
				account_id: 用户ID
				machine_id: 机器ID
				name: 名字
				description: 描述
				script: 启动docker的脚本


GET 	/user/profile/:id 			// 获取一个配置信息
			--params
				id: 配置ID
			--response
				_id: 配置id
				account_id: 用户ID
				machine_id: 机器ID
				name: 名字
				description: 描述
				script: 启动docker的脚本

PUT 	/user/profile/:id 			// 修改一个配置信息
			--params
				id: 配置ID
			--body
				* 参考 POST /user/profile

DELETE 	/user/profile/:id 			// 删除一个配置信息
			--params
				id: 配置ID

```

## DOCKER API

process docker进程

```

GET 	/process/:id 				// 启动docker后，通知服务器
			--params
				id: docker进程ID

DELETE 	/process/:id 				// 关闭docker时，通知服务器
			--params
				id: docker进程ID

```

crawler mission

```
GET 	/mission/:id 				// 始初化完成后，开始执行爬虫任务
			--params
				id: 任务ID
			--response
				urls: 新任务队列

POST 	/mission/:id 				// 每完成一个任务，通知服务器.
			--params
				id: 任务ID			
			--body
				url: 执行完的url
				content: 对应url的内容
				links: 页面上其他links
				queue: 剩余的执行队列数量
			--response
				urls: 新任务队列

```

## MANAGER API

content store

```
GET 	/content/:id 				// 根据urlID获取content
			--params
				id: md5(url)

```
