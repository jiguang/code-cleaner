/**
 @title Code Cleaner V1.0
 @author jiguang
 @mail jiguang1984#gmail.com
 @site http://44ux.com
 @date 2012-11-07
 */

// the editor
var editor;

// set code with options
var setCode = function(html_source){
    editor.setValue(style_html(html_source, {
            indent_size: 2,
            max_char: 0
    }));
};

// shop tip
var showTip = function(text){
    $('#tip').html(text).show().delay(4000).slideUp(300);
};

var init = function(){
    editor = CodeMirror.fromTextArea($('#code')[0], {
        mode: "text/html", tabMode: "indent",
        lineNumbers: true
    });

    // zeroclipboard
    ZeroClipboard.setMoviePath( 'assets/ZeroClipboard.swf' );
    var clip = new ZeroClipboard.Client();
    clip.setHandCursor(true);

    clip.addEventListener('mouseDown', function(client) {
        // set text to copy here
        clip.setText(editor.getValue());
    } );

    clip.addEventListener('complete', function(){
        showTip('Copy Success!')
    } );
    clip.glue('btn_copy');

    // edit options
    $('#advanced').click(function(){ $('#advanced_panel').toggle(); });
    $('#btn_undo').click(function(){ editor.undo(); });
    $('#btn_clear').click(function(){ setCode(''); });

    // clean attribute(s)
    $('#btn_clean_attr').click(function(){
        if(editor.getValue() === ''){
            showTip('Please input the code to be cleaned.');
            return;
        }
        var tag = $('#common_attr').val();

        if(tag!=''){
            setCode(Clearner.cleanAttr(editor.getValue(),tag));
        }else{
            showTip('Please input the name of the attribute.');
        }
    });

    // clean custom attribute(s)
    $('#btn_clean_all_custom').click(function(){
        if(editor.getValue() === ''){
            showTip('Please input the code to be cleaned.');
            return;
        }
        var ret = Clearner.cleanAllCustomAttr(editor.getValue());
        if(ret && ret.deleteAttr!=''){
            setCode(ret.str);

            showTip('Already removed：'+ ret.deleteAttr);
        }else{
            showTip('Code has no custom attributes.');
        }
    });

    // clean by custom reg
    $('#btn_custom').click(function(){
        if(editor.getValue() === ''){
            showTip('Please input the code to be cleaned.');
            return;
        }
        if($('#custom_reg').val() === ''){
            showTip('Please input JavaScript Regular Expression.');
        }else{
            var reg = new RegExp($('#custom_reg').val(),"ig");
            setCode(Clearner.clean(editor.getValue(), reg, $('#custom_replace').val()));
        }
    });

    // only keep common attributes
    $('#common_attr').keyup(function(event){

        if(editor.getValue() != '' && event.keyCode!= '8'){
            var reg = new RegExp('\\b'+this.value + '\\S*\\s*(?=\\=)','ig');
            var match = editor.getValue().match(reg);

            if(match){
                $('#common_attr_tip').html(match[0]);
            }

            if(event.keyCode == '13'){
                $('#common_attr').val($('#common_attr_tip').html());
            }
        }
    });

    // replace all
    $('#btn_replace_all').click(function(){
        if(editor.getValue() === ''){
            showTip('Please input the code to be cleaned.');
            return;
        }

        var cache = editor.getValue();
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

    // clean custom text
    $('#btn_custom_txt').click(function(){
        setCode(Clearner.cleanText(editor.getValue(),$('#custom_txt').val()));
    });
};

/* basic */
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
            var reg = new RegExp('<'+ tagName +'[^>]*>(.|\\n)*?(?=<\\/'+ tagName +'>)<\\/'+ tagName +'>\\n?','ig');
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

$(function(){
    init();
});

