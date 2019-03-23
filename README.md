## 插件介绍

为 [utools](https://u.tools) 开发的插件. 可以<del>快速</del>批量地修改某个文件夹下的文件名

具体功能如下: 

- 按照指定格式重命名文件
- 增加前缀和后缀
- 替换文件名中某些字符串, 支持正则
- 修改类型名

## 技术栈

Vue.js + Element UI

utools支持暴露部分nodeJs和electron的部分api

## 部分问题

- 偶尔会出现很长时间的卡顿, 使用dev tools做profile, 发现这部分时间处于idle. 但是这个idle具体在干什么没查清楚, 怀疑很大可能是在GC
- 懒得写注释, 一个js写到底