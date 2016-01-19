# dockerone-crawler-server

server docker: https://hub.docker.com/r/kerngven/dockerone-crawler-server

client github: https://github.com/wohaokun/dockerone-crawler-client

client docker: https://hub.docker.com/r/kerngven/dockerone-crawler-client


# process.env

```
    hostname=127.0.0.1:3000 #visit url
    mongodb=mongodb://127.0.0.1:27017" #mongodb (save user info, machine info, profile info)
    redis=127.0.0.1:6379 #redis db (cache url md5 id)
    elasticsearch=127.0.0.1:9200 #elasticsearch db (carwler content)

```

## UI API

account 用户信息

```

// 注册账户
PUT		/user/account 				
			--body
				name: 用户名
				email: 邮箱
				password: 密码

// 用户登录
POST 	/user/account 				
			--body
				email: 邮箱
				password: 密码

```

machine 用户机器配置

```

// 创建一个机器信息
POST 	/user/machine 				
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

//获取当前用户所有的机器信息
GET 	/user/machines 				
			--response[]
				_id: 机器id
				account_id: 用户ID
				name: 名字
				description: 描述

// 获取一个机器信息
GET 	/user/machine/:id 			
			--params
				id: 机器ID
			--response
				_id: 机器id
				account_id: 用户ID
				name: 名字
				description: 描述

// 修改一个机器信息
PUT 	/user/machine/:id 			
			--params
				id: 机器ID
			--body
				* 参考 POST /user/machine

// 删除一个机器信息
DELETE 	/user/machine/:id 			
			--params
				id: 机器ID

```

profile docker配置

```

// 创建一个配置信息
POST 	/user/profile 				
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

//获取当前用户某个机器上的所有配置信息
GET 	/user/profiles/:machine_id 	
			--params
				machine_id: 机器ID
			--response[]
				_id: 配置id
				account_id: 用户ID
				machine_id: 机器ID
				name: 名字
				description: 描述
				script: 启动docker的脚本


// 获取一个配置信息
GET 	/user/profile/:id 			
			--params
				id: 配置ID
			--response
				_id: 配置id
				account_id: 用户ID
				machine_id: 机器ID
				name: 名字
				description: 描述
				script: 启动docker的脚本

// 修改一个配置信息
PUT 	/user/profile/:id 			
			--params
				id: 配置ID
			--body
				* 参考 POST /user/profile

// 删除一个配置信息
DELETE 	/user/profile/:id 			
			--params
				id: 配置ID

```

统计数据

```
//获取统计数据
GET 	/user/analysis/:machineId?/:profilesId?
			--params
				machineId: 机器信息id
				profilesId: 配置信息id

```

## DOCKER API

process docker进程

```

// 启动docker后，通知服务器
GET 	/process/:id 				
			--params
				id: docker进程ID

// 关闭docker时，通知服务器
DELETE 	/process/:id 				
			--params
				id: docker进程ID

```

crawler mission

```
// 始初化完成后，开始执行爬虫任务
GET 	/mission/:id 				
			--params
				id: 任务ID
			--response
				urls: 新任务队列

// 每完成一个任务，通知服务器.
POST 	/mission/:id 				
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
// 根据urlID获取content
GET 	/content/:id 				
			--params
				id: md5(url)

// 查询url store
GET 	/contents 					
			--query
				words: key

```


# run
```
	node index.js
```