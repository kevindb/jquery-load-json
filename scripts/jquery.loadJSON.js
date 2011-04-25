(function ($) {
    $.fn.loadJSON = function (obj, options) {

        function setElementValue(element, value, name) {
            var type = element.type || element.tagName;
            if (type == null)
                return;
            type = type.toLowerCase();
            switch (type) {

                case 'radio':
                    if (value.toString().toLowerCase() == element.value.toLowerCase())
                        $(element).attr("checked", "checked");
                    break;

                case 'checkbox':
                    if (value)
                        $(element).attr("checked", "checked");
                    break;

                case 'select-multiple':
                    var values = value.constructor == Array ? value : [value];
                    for (var i = 0; i < element.options.length; i++) {
                        for (var j = 0; j < values.length; j++) {
                            element.options[i].selected |= element.options[i].value == values[j];
                        }
                    }
                    break;

                case 'select':
                case 'select-one':
                case 'text':
                case 'hidden':
                    $(element).attr("value", value);
                    break;
                case 'a':
                    var href = $(element).attr("href");
                    var iPosition = href.indexOf('?');
                    if (iPosition > 0)
                        href = href.substring(0, iPosition) + '?' + name + '=' + value;
                    else
                        href = href + '?' + name + '=' + value;
                    $(element).attr("href", href);
                    break;

                case 'textarea':
                case 'submit':
                case 'button':
                default:
                    try {
                        $(element).html(value);
                    } catch (exc) { }
            }

        }

        function browseJSON(obj, element, name) {

            // no object
            if (obj == undefined) {
            }
            // branch
            else if (obj.constructor == Object) {
                for (var prop in obj) {
                    if (prop == null)
                        continue;
                    //Find an element with class, id, name, or rel attribute that matches the propertu name
                    var child = jQuery.makeArray(jQuery("." + prop, element)).length > 0 ? jQuery("." + prop, element) :
                                                    jQuery("#" + prop, element).length > 0 ? jQuery("#" + prop, element) :
                                                    jQuery('[name="' + prop + '"]', element).length > 0 ? jQuery('[name="' + prop + '"]', element) : jQuery('[rel="' + prop + '"]');
                    if (child.length != 0)
                        browseJSON(obj[prop], jQuery(child, element), prop);
                }
            }
            // array
            else if (obj.constructor == Array) {
                if (element.length > 0 && element[0].tagName == "SELECT") {
                    setElementValue(element[0], obj, name);
                } else {
                    var arr = jQuery.makeArray(element);
                    //how many duplicate
                    var nbToCreate = obj.length - arr.length;
                    var i = 0;
                    for (iExist = 0; iExist < arr.length; iExist++) {
                        if (i < obj.length) {
                            $(element).eq(iExist).loadJSON(obj[i]);
                        }
                        i++;
                    }
                    //fill started by last
                    i = obj.length - 1;
                    for (iCreate = 0; iCreate < nbToCreate; iCreate++) {
                        //duplicate the last
                        $(arr[arr.length - 1]).clone(true).insertAfter(arr[arr.length - 1]).loadJSON(obj[i]);
                        i--;
                    }
                }
            }
            // data only
            else {
                var value = obj;
                var type;
                if (element.length > 0) {
                    for (i = 0; i < element.length; i++)
                        setElementValue(element[i], obj, name);
                }
                else {
                    setElementValue(element, obj, name);
                }
            }
        } //function browseJSON end

        var defaults = {
            sID: "id",
            sAddURL: "AddData"
        };

        properties = $.extend(defaults, options);

        return this.each(function () {

            if (obj.constructor == String) {
                var element = $(this);
                $.get(obj, function (data) {
                    element.loadJSON(data);
                });
            }

            else {
                browseJSON(obj, this);
            }
        });
    };
})(jQuery);