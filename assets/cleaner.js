/**
 @title Code Cleaner V1.0
 @author jiguang
 @mail jiguang1984#gmail.com
 @site http://44ux.com
 @date 2012-11-07
 */

var codeCache = [],
    editor;

var Clearner = {

    formatSelection: function(all){
        if(all){
            CodeMirror.commands["selectAll"](editor);
        }

        var range = {
            from: editor.getCursor(true),
            to: editor.getCursor(false)
        };
        editor.autoFormatRange(range.from, range.to);
        return editor.getValue();
    },

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

var setCode = function(code, noSave){

    noSave = noSave || false;

    if( !noSave && $('#code').val() != codeCache[codeCache.length-1]){
        codeCache.push($('#code').val());
        $('#btn_back').removeAttr('disabled').html('Undo('+codeCache.length+')');
    }

    $('#code').val(code);
    editor.setValue(code);
};

var init = function(){

    editor = CodeMirror.fromTextArea($('#code')[0], {
        mode: "text/html", tabMode: "indent",
        lineNumbers: true
    });

    $('#advanced').click(function(){
        $('#advanced_panel').toggle();
    });

    $('#btn_format').click(function(){
        setCode(Clearner.formatSelection(true));
    });

    $('#btn_format_selection').click(function(){
        setCode(Clearner.formatSelection());
    });

    $('#btn_clean_attr').click(function(){
        if($('#code').val() == ''){
            alert('Please input the code to be cleaned.');
            return;
        }
        var tag = $('#common_attr').val();

        if(tag!=''){
            setCode(Clearner.cleanAttr($('#code').val(),tag));
        }else{
            alert('Please input the name of the attribute.');
        }
    });

    $('#btn_clean_all_custom').click(function(){
        if($('#code').val() == ''){
            alert('Please input the code to be cleaned.');
            return;
        }
        var ret = Clearner.cleanAllCustomAttr($('#code').val());
        if(ret && ret.deleteAttr!=''){
            setCode(ret.str);

            alert('Already removed：'+ ret.deleteAttr);
        }else{
            alert('Code has no custom attributes.');
        }
    });

    $('#btn_custom').click(function(){
        if($('#code').val() == ''){
            alert('Please input the code to be cleaned.');
            return;
        }
        if($('#custom_reg').val() == ''){
            alert('Please input JavaScript Regular Expression.');
        }else{
            var reg = new RegExp($('#custom_reg').val(),"ig");
            setCode(Clearner.clean($('#code').val(), reg, $('#custom_replace').val()));
        }
    });

    $('#common_attr').keyup(function(event){

        if($('#code').val() != '' && event.keyCode!= '8'){
            var reg = new RegExp('\\b'+this.value + '\\S*\\s*(?=\\=)','ig');
            var match = $('#code').val().match(reg);

            if(match){
                $('#common_attr_tip').html(match[0]);
            }

            if(event.keyCode == '13'){
                $('#common_attr').val($('#common_attr_tip').html());
            }
        }
    });

    $('#btn_replace_all').click(function(){
        if($('#code').val() == ''){
            alert('Please input the code to be cleaned.');
            return;
        }

        var cache = $('#code').val();
        $('#opt input:checked').each(function(){
            cache = Clearner[$(this).val()](cache);
        });

        setCode(cache);
    });

    var isSelectAll = true;
    $('#btn_dis_all').click(function(){

        if(isSelectAll){
            $('#opt input:checked').each(function(){
                $(this).removeAttr('checked');
            });
            $(this).html('Check All');
        }else{
            $('#opt input').each(function(){
                $(this).attr('checked', 'checked');
            });
            $(this).html('Cancel All');
        }
        isSelectAll = !isSelectAll;
    });

    $('#btn_custom_txt').click(function(){
        setCode(Clearner.cleanText($('#code').val(),$('#custom_txt').val()));
    });

    $('#btn_back').click(function(){

        if(codeCache.length == 0 || typeof codeCache[codeCache.length-1] === 'undefined'){
            return;
        }

        if(codeCache.length == 1){
            $('#btn_back').attr('disabled', 'disabled');
        }

        setCode(codeCache.pop(), true);
        $('#btn_back').html('Undo('+codeCache.length+')');
    });

    $('.CodeMirror').keyup(function(){
        $('#code').val(editor.getValue());
    });

};

$(function(){
    init();
});

