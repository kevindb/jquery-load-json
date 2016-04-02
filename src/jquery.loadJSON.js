/*
* jQuery loadJSON plugin
* v1.3.1
* https://github.com/kevindb/jquery-load-json
*
* This is a jQuery plugin that enables developers to load JSON data from the server and load JSON object into the DOM.
*
* Copyright 2015 Kevin Morris
* Copyright 2011 Jovan Popovic
* Copyright 2008 Alexandre Caprais
*
* This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General Public
* License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option) any later version.
*
* This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
*/

(function ($) {
	$.fn.loadJSON = function (obj, options) {
		Array.prototype.contains = function(obj) {
		    var i = this.length;
		    while (i--) {
		        if (this[i] == obj) {
		            return true;
		        }
		    }
		    return false;
		}

		function refreshMobileSelect($element) {
			try {
				if ($.isFunction($element.selectmenu)) {
					$element.selectmenu('refresh'); //used in the JQuery mobile
				}

			} catch (ex) { }
		}

		function refreshMobileCheckBox($element) {
			try {
				if ($.isFunction($element.checkboxradio)) {
					$element.checkboxradio('refresh'); //used in the JQuery mobile
				}
			} catch (ex) { }
		}

		function loadSelect(element, aoValues, name) {
			///<summary>
			///Load options into the select list
			///</summary>
			///<param name="element" type="JQuery:select">Select list</param>
			///<param name="aoValues" type="Array{value,text,selected}">Array of object containin the options</param>
			///<param name="name" type="String">Name of the select list</param>

			var arr = jQuery.makeArray(element);
			var template = $(arr[arr.length - 1]).clone(true);
			//how many duplicate
			var nbToCreate = obj.length;
			var i = 0;
			//fill started by last
			i = obj.length - 1;
			var iCreate = 0;
			for (iCreate = 0; iCreate < nbToCreate; iCreate++) {
				//duplicate the last
				var last = template.clone(true).insertAfter(arr[arr.length - 1]);
				//setElementValue(last, obj[i], name);
				$(last).attr('value', obj[i].value);
				$(last).text(obj[i].text);
				if (obj[i].selected)
					$(last).attr('selected', true);
				i--;
			}

			///////////////////////////////////////////////////////////////////////////////////////////
			refreshMobileSelect($(element));
			//////////////////////////////////////////////////////////////////////////////////////////
		}

		function setElementValue(element, value, name) {
			var $element = $(element);
			var type = element.type || element.tagName;
			if (type === null) {
				type = element[0].type || element[0].tagName; //select returns undefined if called directly
				if (type === null) {
					return;
				}
			}
			type = type.toLowerCase();
			switch (type) {
				case 'radio':
					if (value.toString().toLowerCase() == element.value.toLowerCase()) {
						$element.prop('checked', true);
					} else {
						$element.removeAttr('checked');
					}
					refreshMobileCheckBox($element);
					break;

				case 'checkbox':
					var elementValue = $element.val();

					if ((value.constructor == Array && value.contains(elementValue)) || value == elementValue) {
						$element.prop('checked', true);
					} else {
						$element.removeAttr('checked');
					}
					refreshMobileCheckBox($element);
					break;

				case 'option':
					$element.attr('value', value.value);
					$element.text(value.text);
					if (value.selected) {
						$element.attr('selected', true);
					}
					break;

				case 'select-multiple':
					// This is "interesting". In mobile use element.options while in the desktop use element[0].options
					var select = element[0];

					if (element[0].options === null || typeof (element[0].options) == 'undefined') {
						select = element;
					}

					if (select.options.length > 1) {
						// If select list is not empty use values array to select options
						var values = value.constructor == Array ? value : [value];

						// Replaced element with element[0] ???? because now it reports that element.options does not exist
						for (var i = 0; i < select.options.length; i++) {
							for (var j = 0; j < values.length; j++) {
								select.options[i].selected |= select.options[i].value == values[j];
							}
						}

						refreshMobileSelect($element);

					} else {
						// Instead of selecting values use values array to populate select list
						loadSelect(element, value, name);
					}
					break;

				case 'select':
				case 'select-one':
					if (value.constructor == Array) {
						loadSelect(element, value, name);

					} else {
						$element.val(value);
						refreshMobileSelect($element);
					}
					break;

				case 'color':
				case 'date':
				case 'datetime':
				case 'datetime-local':
				case 'email':
				case 'hidden':
				case 'month':
				case 'number':
				case 'password':
				case 'range':
				case 'search':
				case 'tel':
				case 'text':
				case 'time':
				case 'url':
				case 'week':
					$element.val(value);
					break;

				case 'a':
					var href = $element.attr('href');

					if (href) {					// If a href value exists, append value
						var iPosition = href.indexOf('#');

						if (iPosition > 1000000) {
							href = href.substr(0, iPosition) + '&' + name + '=' + value + href.substr(iPosition);
						} else {
							iPosition = href.indexOf('?');
							if (iPosition > 0)	// If parameters in the URL exists add new pair using &
								href += '&' + name + '=' + value;
							else				//otherwise attach pair to URL
								href = href + '?' + name + '=' + value;
						}
					} else {					// If no href exists, set href to value
						href = value;
					}
					$element.attr('href', href);
					break;

				case 'img':

					if (obj.constructor == 'String') {
						//Assumption is that value is in the HREF$ALT format
						var iPosition = value.indexOf('$');
						var src = '';
						var alt = '';
						if (iPosition > 0) {
							src = value.substring(0, iPosition);
							alt = value.substring(iPosition + 1);

						} else {
							src = value;
							var iPositionStart = value.lastIndexOf('/') + 1;
							var iPositionEnd = value.indexOf('.');
							alt = value.substring(iPositionStart, iPositionEnd);
						}
						$element.attr('src', src);
						$element.attr('alt', alt);

					} else {
						$element.attr('src', obj.src);
						$element.attr('alt', obj.alt);
						$element.attr('title', obj.title);
					}
					break;

				case 'textarea':
				case 'submit':
				case 'button':
				default:
					try {
						$element.html(value.toString());
					} catch (exc) { }
			}

		}

		function browseJSON(obj, element, name) {
			var $element = $(element);

			// no object
			if (obj === undefined) {
				// Do nothing

			// branch
			} else if (obj.constructor == Object) {
				if (element.length >= 1 && element[0].tagName == 'OPTION') {
					setElementValue(element[0], obj, name);
				}

				for (var prop in obj) {
					if (prop === null || typeof prop == 'undefined')
						continue;
					else {
						//Find an element with class, id, name, or rel attribute that matches the property name
						var child = jQuery.makeArray(jQuery('.' + prop, element)).length > 0 ? jQuery('.' + prop, element) :
													jQuery('#' + prop, element).length > 0 ? jQuery('#' + prop, element) :
													jQuery('[name="' + prop + '"]', element).length > 0 ? jQuery('[name="' + prop + '"]', element) :
													jQuery('[rel="' + prop + '"]');
						if (child.length != 0) {
							browseJSON(obj[prop], jQuery(child, element), prop);
						}
					}
				}

			// array
			} else if (obj.constructor == Array) {
				if (element.length == 1 &&
						(element.type == 'select' || element.type == 'select-one' || element.type == 'select-multiple' ||
						element[0].type == 'select' || element[0].type == 'select-one' || element[0].type == 'select-multiple'
					)) {

					///nova dva reda
					setElementValue(element, obj, name);
					return;
				} else if (element.length > 0 && element.filter('input:hidden').length > 0 && element.filter(':checkbox').length > 0) {
					element.filter(':checkbox').each(function () {
						setElementValue(this, obj, name);
					});
				} else if (element.length > 0 && element[0].type == 'checkbox') {
					element.each(function() {
						setElementValue(this, obj, name);
					});

				} else {
					var arrayElements = $element.children('[rel]');
					if (arrayElements.length > 0) {					//if there are rel=[index] elements populate them instead of iteration
						arrayElements.each(function () {
							var $this = $(this);
							var rel = $this.attr('rel');
							browseJSON(obj[rel], $this, name);
						});

					} else {										//recursive iteration
						var arr = jQuery.makeArray(element);
						var template = $(arr[arr.length - 1]).clone(true);
						var nbToCreate = obj.length;				//how many duplicate
						var i = 0;
						if (element[0] === null || (element[0] !== null && element[0].tagName != 'OPTION')) {
							var iExist = 0;
							for (iExist = 0; iExist < arr.length; iExist++) {
								if (i < obj.length) {
									var elem = $element.eq(iExist);
									browseJSON(obj[i], elem, name);
								}
								i++;
							}
							nbToCreate = obj.length - arr.length;
						}
						//fill started by last
						i = obj.length - 1;
						var iCreate = 0;
						for (iCreate = 0; iCreate < nbToCreate; iCreate++) {
							//duplicate the last
							var last = template.clone(true).insertAfter(arr[arr.length - 1]);
							browseJSON(obj[i], last, name);
							i--;
						}
					}
				}

			// data only
			} else {
				var value = obj;
				var type;
				if (element.length > 0) {
					if (element.filter('input:hidden').length > 0 && element.filter(':checkbox').length > 0) {
						setElementValue(element.filter(':checkbox').first()[0], obj, name);
					} else {
						var i = 0;
						for (i = 0; i < element.length; i++) {
							setElementValue(element[i], obj, name);
						}
					}
				} else {
					setElementValue(element, obj, name);
				}
			}
		} //function browseJSON end

		function init(placeholder) {
			var template;

			if (placeholder.data('loadJSON-template') !== null && placeholder.data('loadJSON-template') != '') {
				template = placeholder.data('loadJSON-template');
				placeholder.html(template);
			} else {
				template = placeholder.html();
				placeholder.data('loadJSON-template', template);
			}
		}

		var defaults = {
			onLoading: function () { },
			onLoaded: function () { },
			mobile: false
		};

		properties = $.extend(defaults, options);

		return this.each(function () {
			var $this = $(this);

			if (obj.constructor == String) {
				if (obj.charAt(0) == '{' || obj.charAt(0) == '[') {
					var data = $.parseJSON(obj);
					init($this);
					properties.onLoading();
					browseJSON(data, this);
					properties.onLoaded();
				}
				else {
					var element = $this;
					$.ajax({ url: obj,
						success: function (data) {
							element.loadJSON(data, properties);
						},
						cache: false,
						dataType: 'json'
					});
				}
			}

			else {
				init($this);
				properties.onLoading();
				browseJSON(obj, this);
				properties.onLoaded();
			}
		});
	};
})(jQuery);
