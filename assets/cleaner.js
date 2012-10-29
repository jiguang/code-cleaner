/*
 @title Code Cleaner V0.1
 @author jiguang
 @mail jiguang1984#gmail.com
 @site http://44ux.com
 @date 20110728
 */

var $ = function(id){
    if('string' == typeof id || id instanceof String){
        return document.getElementById(id);
    }else if(id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
        return id;
    }
    return null;
};

var codeCache = [];

var Clearner = {
    clean: function(str, regEx, replaceStr){
        if(str && typeof str === 'string'){
            if(replaceStr && typeof replaceStr === 'string'){
                str = str.replace(regEx, replaceStr);
            }else{
                str = str.replace(regEx,'');
            }
            return str;
        }else{
            return '';
        }
    },
    cleanAttr: function(str, attrName, replaceStr){
        if(str && typeof str === 'string' && attrName && typeof attrName === 'string'){
            var reg = new RegExp('(\\s'+attrName+'\\s*=\\s*(([\"\'][^\"\'>]*[\'\"])|(\\w*)))','ig');

            if(replaceStr && typeof replaceStr === 'string'){
                str = this.clean(str,reg,replaceStr);
            }else{
                str = this.clean(str,reg);
            }
            return str;
        }else{
            return '';
        }
    },
    cleanTag: function(str,tagName){
        if(str && typeof str === 'string' && tagName && typeof tagName === 'string'){
            var reg = new RegExp('<'+ tagName +'[^>]*>(.|\\n)*?(?=<\\/'+ tagName +'>)<\\/'+ tagName +'>','ig');
            return this.clean(str,reg);
        }
    },
    cleanClassName: function(str){
        return this.cleanAttr(str,'class',' class=""');
    },
    cleanId: function(str){
        return this.cleanAttr(str,'id');
    },
    cleanInlineStyle: function(str){
        return this.cleanAttr(str,'style');
    },
    cleanTable: function(str){
        str = this.cleanAttr(str,'valign');
        str = this.cleanAttr(str,'align');
        str = this.cleanAttr(str,'height');
        str = this.cleanAttr(str,'width');
        return str;
    },
    cleanLink: function(str){
        str = this.cleanAttr(str,'href',' href="#"');
        str = this.cleanAttr(str,'title',' title=""');
        return str;
    },
    cleanImg: function(str){
        str = this.cleanAttr(str,'alt',' alt=""');
        str = this.cleanAttr(str,'src',' src=""');
        str = this.cleanAttr(str,'title',' title=""');
        return str;
    },
    cleanScript: function(str){
        return this.cleanTag(str,'script');
    },
    cleanText: function(str,replace){
        var dom = document.createElement('div');
        dom.innerHTML = str;

        function deep(node){
            if(node.tagName != 'SCRIPT'){
                for(var i=0,j=node.childNodes.length; i<j; ++i){
                    if(node.childNodes[i] && node.childNodes[i].nodeType == 3){
                        if(node.childNodes[i].nodeValue.replace(/(^\s*)|(\s*$)/,'').length == 0) continue;
                        replace?node.childNodes[i].nodeValue = replace:node.childNodes[i].nodeValue = '';
                    }else if(node.childNodes[i] && node.childNodes[i].nodeType == 1){
                        deep(node.childNodes[i]);
                    }
                }
            }
        }
        deep(dom);

        /******** can not handle attributes which include DOM
         var newStr =  dom.innerHTML.replace(/<\/?\w+/ig,function(tag){
         return tag.toLowerCase();
         });
         newStr = newStr.replace(/\b\w*=\s*[^'"\s>]+/ig,function(attr){
         return attr.split('=')[0] + '="' + attr.split('=')[1] + '"';
         });
         return newStr;
         */
        return dom.innerHTML;
    },
    cleanBr: function(str){
        return this.clean(str,/<br\s*\/?>\n*/ig);
    },
    cleanSpaceRow: function(str){
        return this.clean(str,/(\r?\n(\s)*)+(?=\r?\n)/ig);
    },
    cleanHtmlComment: function(str){
        return this.clean(str,/<!--[^-]*(.|\n)*?(?=-->)-->/ig);
    },
    cleanAllCustomAttr: function(str){
        var attrListReg = /\sclass|\stitle|\ssrc|\salt|\shref|\starget|\stype|\sname|\svalue|\schecked|\sdisabled|\smothod|\saction|\sfor|\srel|\sref|\scolspan|\srowspan|\scellpadding|\scellspacing/i;

        var deleteAttr = '';

        str = str.replace(/(\s\w+(\-)?\w+\s*=\s*'[^'>]*')|(\s\w+(\-)?\w+\s*=\s*"[^">]*")|(\s\\w+(\-)?\w+\s*=\s*\w*)/ig,function(attr){
            if(attrListReg.test(attr.split('=')[0])){
                return attr.split('=')[0]=='href' ? attr.split('=')[0] + '="#"': attr.split('=')[0] + '=""';
            }else{
                if(deleteAttr.indexOf(attr.split('=')[0])<0){
                    deleteAttr = deleteAttr + ' | ' + attr.split('=')[0];
                }
                return '';
            }
        });
        return {'str':str, 'deleteAttr': deleteAttr};
    }
};

var saveRecord = function(){
    if($('code').value != codeCache[codeCache.length-1]){
        codeCache.push($('code').value);
        $('btn_back').disabled = false;
    }
};

var toggleFold = function(trigger,contentId){
    if(trigger && contentId && $(contentId).style){
        if($(contentId).style.display == 'none'){
            $(contentId).style.display = 'block';
            trigger.className = 'unfold';
            trigger.getElementsByTagName('span')[0].innerHTML = '↑';
        }else if($(contentId).style.display = 'block'){
            $(contentId).style.display = 'none';
            trigger.className = 'fold';
            trigger.getElementsByTagName('span')[0].innerHTML = '↓';
        }
    }
};

var init = function(){

    $('advanced').onclick = function(){
        toggleFold(this,'advanced_panel');
    };

    $('code').onkeyup = function(){
        $('btn_clear').disabled = !(this.value!='');
    };

    $('btn_clear').onclick = function(){
        saveRecord();
        $('code').value = '';
        this.disabled = true;
    };

    $('btn_clean_attr').onclick = function(){
        if($('code').value == ''){
            alert('Please input the code to be cleaned.');
            return;
        }
        var tag = $('common_attr').value;

        if(tag!=''){
            saveRecord();
            $('code').value = Clearner.cleanAttr($('code').value,tag);
        }else{
            alert('Please input the name of the attribute.');
        }
    };

    $('btn_clean_all_custom').onclick = function(){
        if($('code').value == ''){
            alert('Please input the code to be cleaned.');
            return;
        }
        saveRecord();
        var ret = Clearner.cleanAllCustomAttr($('code').value);
        if(ret && ret.deleteAttr!=''){
            $('code').value = ret.str;
            alert('Already removed：'+ ret.deleteAttr);
        }else{
            alert('Codes had none custom attributes.');
        }
    };

    $('btn_custom').onclick = function(){
        if($('code').value == ''){
            alert('Please input the code to be cleaned.');
            return;
        }
        if($('custom_reg').value == ''){
            alert('Please input JavaScript Regular Expression.');
        }else{
            var reg = new RegExp($('custom_reg').value,"ig");
            saveRecord();
            $('code').value = Clearner.clean($('code').value,reg,$('custom_replace').value);
        }
    };

    $('common_attr').onkeyup = function(event){
        var evt = event || window.event;
        if($('code').value!=''&& evt.keyCode!= '8'){
            var reg = new RegExp('\\b'+this.value + '\\S*\\s*(?=\\=)','ig');
            var match = $('code').value.match(reg);

            if(match){
                $('common_attr_tip').innerHTML = match[0];
            }

            if(evt.keyCode == '13'){
                var tag = $('common_attr').value = $('common_attr_tip').innerHTML;
            }
        }
    };

    $('btn_replace_all').onclick = function(){
        if($('code').value == ''){
            alert('Please input the code to be cleaned.');
            return;
        }
        var optList = $('opt').getElementsByTagName('li');
        saveRecord();

        var cache = $('code').value;
        for(var i=0,j=optList.length; i<j; ++i){
            if(optList[i].getElementsByTagName('input')[0].checked){
                cache = Clearner[optList[i].getElementsByTagName('input')[0].value](cache);
            }
        }
        $('code').value = cache;
    };

    var isSelectAll = true;
    $('btn_dis_all').onclick = function(){
        var optList = $('opt').getElementsByTagName('li');

        if(isSelectAll){
            for(var i=0,j=optList.length; i<j; ++i){
                optList[i].getElementsByTagName('input')[0].checked = false;
            }
            this.innerHTML = 'Check All';
        }else{
            for(var k=0,m=optList.length; k<m; ++k){
                optList[k].getElementsByTagName('input')[0].checked = true;
            }
            this.innerHTML = 'Cancel All';
        }
        isSelectAll = !isSelectAll;
    };

    $('btn_custom_txt').onclick = function(){
        saveRecord();
        $('code').value = Clearner.cleanText($('code').value,$('custom_txt').value);
    };

    $('btn_back').onclick = function(){
        if(codeCache.length>1 && typeof codeCache[codeCache.length-1] !== 'undefined'){
            $('code').value = codeCache.pop();
        }else if(codeCache.length == 1){
            $('code').value = codeCache.pop();
            $('btn_back').disabled = true;
        }

        if($('btn_clear').disabled && $('code').value != ''){
            $('btn_clear').disabled = false;
        }
    };
};

window.onload = function(){
    init();
};
