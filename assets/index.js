/*
 * Project: assets
 * File Created: 2019-03-20
 * Author: Helium (ericyc4@gmail.com)
 * Description: 
 * ------
 * Last Modified: 2019-03-23
 * Modified By: Helium (ericyc4@gmail.com)
 */

// using the natural sorting for the file name
const naturalLangComparator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base'
})

window.onload = function () {
  let app = new Vue({
    el: '#app',
    data: {
      mode: 'rename',

      renameStartNum: 1,
      renameStep: 1,
      renamePadding: 2,
      // remember to check patterns must contain <FILE> or <NUM>
      renameFormatOptions: ['<FILE> <NUM>', '<NUM> <FILE>', '图片 <NUM>', '文件 <NUM>'],
      renameFormat: '<FILE> <NUM>',

      addPrefix: '',
      addSuffix: '',

      subtitutePattern: '',
      subtituteStr: '',
      isRegex: false,

      extToReplace: '',
      extToReplaceWith: '',

      path: '',
      filesNames: [],
      filesData: [],
      multipleSelection: [],

      loading: false,

    },
    methods: {
      // once the selection occurs
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },

      // mannully control the sorting of the name
      handleSort({
        column,
        prop,
        order
      }) {
        [this.filesData, this.multipleSelection].forEach(arr => {
          arr.sort((a, b) => {
            let r = 0;
            if (prop === 'filename') {
              r = naturalLangComparator.compare(a.name, b.name)
            } else {
              r = a[prop] > b[prop]? 1: -1
            }
            return order === "ascending" ? r : -r
          })
        })
      },

      async handleAddFolder() {
        // notice that await must be wrapped by () cuz [] is prior to await
        let path = await window.openFolder()
        this.path = path? path[0]: ''
        await this.loadDir()
      },

      handlePreview() {
        this.clearNewname()
        switch (this.mode) {
          case 'rename':
            this.multipleSelection.forEach((ele, index, arr) => {
              ele.newName = util.format(ele.name, this.renameFormat,
                  this.renameStartNum + index * this.renameStep, this.renamePadding)
              ele.newFullName = util.addNameWithExt(ele.newName, ele.ext)
            })
            break;

          case 'add':
            this.multipleSelection.forEach((ele, index, arr) => {
              ele.newName = util.addPrefixAndSuffix(ele.name, this.addPrefix, this.addSuffix)
              ele.newFullName = util.addNameWithExt(ele.newName, ele.ext)
            })
            break;

          case 'subtitute':
            this.multipleSelection.forEach((ele, index, arr) => {
              let pattern = this.isRegex ? new RegExp(this.subtitutePattern, 'g') : this.subtitutePattern
              ele.newName = util.subtitute(ele.name, pattern, this.subtituteStr)
              ele.newFullName = util.addNameWithExt(ele.newName, ele.ext)
            })
            break;

          case 'extension':
            this.multipleSelection.forEach((ele, index, arr) => {
              if (ele.ext === this.extToReplace) {
                ele.ext = this.extToReplaceWith
                ele.newName = ele.name
                ele.newFullName = util.addNameWithExt(ele.newName, ele.ext)
              }
            })
            break;
          default:
            break;
        }
        // sometimes stuck and stop for seconds, and profile shows much idle time
        // i guess either vue or elementUI forgot to re-render
        // most likely the elementui, so, i force it to rerender the table
        this.$refs.multipleTable.doLayout()
      },

      async handleExecute() {
        this.handlePreview()
        try {
          await this.$confirm('此操作将重命名选中文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })

          let message = ''
          if (this.isDuplicated()) {
            message = '重命名的文件名出现重复!'
          } else if (await this.isConflicted()) {
            message = '文件名和磁盘已有文件名重复!'
          }
          if (message !== '') {
            await this.$alert(message, 'Fatal Error!', {confirmButtonText: '确定'});
            this.$message({
              type: 'warning',
              message: message
            });
            throw new Error(message)
          } else {
            // do the rename process
            await this.writeStatToDisk()
            this.$message({
              type: 'success',
              message: '重命名成功!'
            });
            await this.loadDir()
            this.$refs.multipleTable.clearSelection()
          }
        } catch (e) {
          console.log(e)
          this.$message({
            type: 'info',
            message: '已取消重命名'
          });     
        }
      },

      async loadDir() {
        if (this.path !== '') {
          this.loading = true
          try {
            this.path = this.path.replace('\\', '/')
            let totalDirents = await window.readDir(this.path, {withFileTypes: true})
            this.filesNames = totalDirents.filter(dirent => dirent.isFile())
              .map(dirent => dirent.name)
            this.filesData = await this.getFilesData(this.path, this.filesNames)
            // toggle all selection on load
            this.$refs.multipleTable.toggleAllSelection();
            this.loading = false
            this.$message({
              message: '成功读取',
              type: 'success'
            });
          } catch (error) {
            this.$message({
              message: '读取失败',
              type: 'warning'
            });
            console.log(error)
          }
        }
      },

      async getFilesData(path, fileNames) {
        let fileData = [];
        if (fileNames) {
          fileData = await Promise.all(
            fileNames.map(async (file) => {
              let fileStat = await window.readFileStat(path + '/' + file);
              fileStat.newName = '';
              fileStat.filename = file;
              [fileStat.name, fileStat.ext] = util.extractExt(file);
              fileStat.date = util.millisToDateStr(fileStat.birthtimeMs);
              return fileStat
            })
          )
        }
        return fileData
      },

      clearNewname() {
        this.filesData.forEach((file) => {
          file.newName = ''
          file.newFullName = ''
        })
      },

      // detect whether names in the list are duplicated
      isDuplicated() {
        let fileArr = this.multipleSelection.map((ele) => ele.newFullName)
        return fileArr.length !== (new Set(fileArr)).size
      },

      // detect whether names in the list are conflicted with that in the disk
      async isConflicted() {
        let newFileArr = this.multipleSelection.map((ele) => ele.newFullName)
        let totalDirents = await window.readDir(this.path, {withFileTypes: true})
        let diskFileSet = new Set(totalDirents.filter(dirent => dirent.isFile())
              .map(dirent => dirent.name))
        let flag = false
        return newFileArr.map(file => diskFileSet.has(file)).reduce((a, b) => a||b)
      },

      async writeStatToDisk() {
        this.multipleSelection.forEach(async (ele) => {
          if (ele.newFullName !== '' && ele.newName !== '') {
            try {
              await window.renameFile(this.path+'/'+ele.filename, this.path+'/'+ele.newFullName)
            } catch (e) {
              console.log(e)
            }
          }
        })
      }
    },

    async mounted() {
      let {code, type, payload} = await window.onPluginEnterSync()
      console.log(code, type, payload)
      if (type === 'files' && payload[0].isDirectory) {
        this.path = payload[0].path
        await this.loadDir()
      }
    },

    watch: {
      mode: function(oldVal, newVal) {
        if (oldVal !== newVal) {
          this.clearNewname()
        }
      }
    }
  })
}
