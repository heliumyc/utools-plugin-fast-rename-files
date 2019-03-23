/*
 * Project: assets
 * File Created: 2019-03-20
 * Author: Helium (ericyc4@gmail.com)
 * Description: 
 * ------
 * Last Modified: 2019-03-23
 * Modified By: Helium (ericyc4@gmail.com)
 */

let util = (function() {
  function extractExt(fileName) {
    let pos = fileName.lastIndexOf(".")
    return [ 
      fileName.substr(0, pos < 0 ? fileName.length : pos), 
      fileName.substr(pos < 0 ? fileName.length : pos+1, fileName.length)
    ]
  }
  
  function _formatNumber(num, padding) {
    let curLen = num.toString().length
    return '0'.repeat(Math.max(0, padding - curLen))+num
  }
  
  function millisToDateStr(time) {
    let date = new Date(time)
    let year = _formatNumber(date.getFullYear(), 4)
    let month = _formatNumber(date.getMonth() + 1, 2)
    let day = _formatNumber(date.getDate(), 2)
    let hour = _formatNumber(date.getHours(), 2)
    let minute = _formatNumber(date.getMinutes(), 2)
    let second = _formatNumber(date.getSeconds(), 2)
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
  
  function format(str, pattern, num, padding) {
    // passing name without ext i.e. variable name
    let newStr = pattern
    // should using literal rather than new RegExp to boost
    // the latter has major impact on the whole process 0.3ms out of 0.5ms delay
    // which is quite obvious and perceivable
    newStr = newStr.replace(/\<FILE\>/g, str)
    newStr = newStr.replace(/\<NUM\>/g, _formatNumber(num, padding))
    return newStr
  }
  
  function addPrefixAndSuffix(str, prefix, suffix) {
    return prefix + str + suffix
  }
  
  function subtitute(str, pattern, replaceStr) {
    // pattern could be a RegExp
    return str.replace(pattern, replaceStr)
  }

  function addNameWithExt(name, ext) {
    return name + (ext === ''? '': '.'+ext)
  }

  return {
    extractExt: extractExt,
    millisToDateStr: millisToDateStr,
    format: format,
    addPrefixAndSuffix: addPrefixAndSuffix,
    subtitute: subtitute,
    addNameWithExt,
  }
})()
