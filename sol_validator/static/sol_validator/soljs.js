var solVersion;
var solErrorClass;
var solSuccessClass;
var solTooltipClass;
var solRequest;
var currentForm;
var errorListId;

var errorListElement = document.getElementById(errorListId);

// An Array to hold all the displayed tooltips
var tooltipElements = [];

/*
 Represents the message object 
 used to display errors correctly.
*/
function SolMessage(elem, ok, message) {
	this.element = elem;
	this.ok = ok;
	this.message = message;
}

/*
 Check if jQuery is loaded
*/
if (window.jQuery){
	$(document).ready(function(){

		// Go through all the forms and check if
		// any of them uses solValidator.
		var allForms = document.forms;
		var allFormsLen = allForms.length;

		for(var i = 0; i < allFormsLen; i++){
			// Add an event listener for all the forms
			// that use solValidator.
			solVersion = $(allForms[i]).attr("sol-validator");
			if (solVersion){
				allForms[i].addEventListener("submit", solFormBuilder);
			}
		}
	});
} else {
	console.log("SolValidator Error: jQuery is not loaded.");
}


/*
 Checks the version of the form and gets
 the information it needs about it in order
 to know what kind of validation to use,
 which solVersion and changes made to CSS classes.
*/
function solFormBuilder(evt){
	evt.preventDefault();

	currentForm = this;

	// Find the version which the solValidator uses.
	// and the css classes for success or errors.
	solErrorClass = $(this).attr("sol-error");
	solSuccessClass = $(this).attr("sol-success");
	errorListId = $(this).attr("sol-errorlist");
	solTooltipClass = $(this).attr("sol-tooltip");

	// Set default CSS classess if none given
	if (!solErrorClass) {
		solErrorClass = "solerror";
	}

	if (!solSuccessClass) {
		solSuccessClass = "solsuccess";
	}

	if (!errorListId) {
		errorListId = "sol-error-displayer";
	}

	if (!solTooltipClass) {
		solTooltipClass = "sol-symbol";
	}

	// Check if the form validation should be done
	// with an AJAX request
	solRequest = this.hasAttribute("sol-request");

	// Check which version is being used, and return
	// false if none of the versions matches.

	switch (solVersion){
		case "placeholder":
			clearPlaceholders();
			break;
		case "tooltip":
			clearTooltips();
			break;
		case "error":
			// Clear error list
			try {
				errorListElement.innerHTML = "";
			} catch (e){
				console.log(e);
			}
			break;
		default:
			this.submit();
			return false;
	}

	// Clear error class
	clearErrorClass();

	// Check if the form should be submited
	// with a request or go on validating
	// with sol attributes
	if (solRequest) {
		solRequestValidator();
		return true;
	} else {
		solValidator();
		return true;
	}
}	
/*
 Goes through each element checking if it has a solValidator
 attribute and if it does and it's not valid, it displays
 errors to that element according to the solVersion.
*/
function solValidator() {

	var formLen = currentForm.length;
	// Contains boolean values (for valid and invalid)
	// for all form elements
	var solMsgObjHolder = [];

	// Go through each form element
	for (var i = 0; i < formLen; i++){
		var formElem = currentForm[i];

		var elemName = formElem.getAttribute("name");
		try {
			elemName = elemName[0].toUpperCase() + elemName.substr(1);
		} catch (e){
			console.log(e);
		}

		// Go through each element attribute and validate
		for (var j = 0; j < formElem.attributes.length; j++){
			var solAttr = formElem.attributes[j];

			// Attribute information
			var attrName = solAttr.name;
			var attrValue = solAttr.value;

			var elemSuccess = true;
			var message = "";

			// Check if it has any of the attributes
			if (attrName == "sol-required"){
				if (formElem.value === undefined || formElem.value === "") {
					message = elemName + " is required";
					elemSuccess = false;
				}
			} else if (attrName == "sol-max_length") {
				if (formElem.value.length > attrValue) {
					message = elemName + " maximum length: " + attrValue;
					elemSuccess = false;
				}
			} else if (attrName == "sol-min_length"){
				if (formElem.value.length < attrValue) {
					message = elemName + " minimum length: " + attrValue;
					elemSuccess = false;
				}
			} else if (attrName == "sol-max_digits"){
				if (formElem.value.length > parseInt(attrValue, 10)) {
					message = elemName + " maximum digits: " + attrValue;
					elemSuccess = false;
				}
			} else if (attrName == "sol-decimal_places"){
				if (countDecimals(formElem.value) > parseInt(attrValue, 10)) {
					message = elemName + " maximum decimals places allowed: " + attrValue;
					elemSuccess = false;
				}
			} else if (attrName == "sol-input_formats") {
			 	var dateFormats = getInputFormats(attrValue);
			 	var validFormats = [];
			 	// Check each format if valid
			 	for (var it = 0; it < dateFormats.length; it++) {
			 		validFormats.push(strftimeChecker(dateFormats[it], formElem.value));
			 	}
			 	// Check if any of the formats is valid
			 	// and if none is valid, display errors.
				if (!validFormats.includes(true)) {
					message = elemName + " invalid format: " + formElem.value;
					elemSuccess = false;
				}
			} else if (attrName == "sol-max_value") {
				if (parseInt(formElem.value, 10) > parseInt(attrValue, 10)) {
					message = elemName + " maximum value allowed: " + attrValue;
					elemSuccess = false;
				}
			} else if (attrName == "sol-min_value") {
				if (parseInt(formElem.value, 10) < parseInt(attrValue, 10)) {
					message = elemName + " minimum value allowed: " + attrValue;
					elemSuccess = false;
				}
			} else {
				continue;
			}

			solMsgObj = new SolMessage(formElem, elemSuccess, message);
			solMsgObjHolder.push(solMsgObj);
		}
	}

	// Check if all form elements are valid
	// if they aren't change that element
	// else if all elements are valid submit the form
	formOk = [];
	for (var i = 0; i < solMsgObjHolder.length; i++) {
		var messageObject = solMsgObjHolder[i];
		displayErrors(messageObject);
		formOk.push(messageObject.ok);
	}

	// Submit if all inputs are valid
	if (!formOk.includes(false)){
		currentForm.submit();
	}

};

/*
 Adds the sol error class to the class
 attribute of the element.
*/
function addErrorClass(elem) {
	// Check if it has a class, if it does add solClasses to it
	// if it doesn't, create the class attribute
	try {
		if(!elem.className) {
			elem.className = solErrorClass;
		} else if (!elem.className.includes(solErrorClass)){
			elem.className += " " + solErrorClass;
		}
	} catch (e) {
		console.log(e);
	}
}

/*
 Displays errors correctly according to 
 the given sol version using displayer functions.
*/
function displayErrors(messageObject) {
	if (!messageObject.ok){
		// Change class
		addErrorClass(messageObject.element);
		// Display the error
		if (solVersion == 'placeholder') {
			palceholderDisplayer(messageObject);
		} else if (solVersion == 'error') {
			errorDisplayer(messageObject);
		} else if (solVersion == 'tooltip') {
			tooltipDisplayer(messageObject);
		}
	}
}

/*
 Makes an AJAX request to check if the form
 is valid in the backend.
*/
function solRequestValidator() {
	var formData = JSON.stringify($(currentForm).serializeArray(currentForm));

	// Send AJAX request
	$.ajax({
		method: 'POST',
		url: currentForm.action,
		data: {
			csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
			form_data: formData,
		},
		success: function(data) {displaySolRequestErrors(data)},
	});
}

/*
 Displays the errors returned
 from the AJAX response.
*/
function displaySolRequestErrors(data) {
	// Check if it's not valid
	if (!data.valid) {
		var errors = data.errors;
		// Create messageObjects (needed to display errors)
		// with the returned data
		for (var err in errors) {
			// Grab fieldname and message error
			var fieldName = errors[err][0];
			var messageError = errors[err][1];

			// Fix message error to be more clear
			// if the solVersion is 'error'
			if (solVersion == 'error') {
				var tempFieldName = fieldName[0].toUpperCase() + fieldName.substring(1);
				messageError = tempFieldName + ": " + messageError;
			}

			// Get element for field and create messageObject
			var element = $("[name="+fieldName+"]")[0];
			var msgObj = new SolMessage(element, false, messageError);

			// Display errors
			displayErrors(msgObj);
		}

	} else {
		currentForm.submit();
	}
}
/*
 Returns an array of input formats	
*/
function getInputFormats(formats) {
	var formatsArray = formats.split("~");
	return formatsArray;
}

/*
 Removes all the tooltips that were created
 on the last submit.
*/
function clearTooltips() {
	// Delete all tooltips that are present
	for (var i = 0; i < tooltipElements.length; i++) {
		$(tooltipElements[i]).remove();
	}
};

/* 
 Removes the solerror class from
 valid inputs.
*/

function clearErrorClass() {
	for (var i = 0; i < currentForm.length; i++) {
		$(currentForm[i]).removeClass("solerror");
	}
}

/* 
 Remove the text in the placeholder attribute
 from all the valid inputs.
*/
function clearPlaceholders() {
	for (var i = 0; i < currentForm.length; i++) {
		$(currentForm[i]).attr("placeholder", "");
	}
}

/*
 Counts how many decimals points are
 and returns the value.
*/
function countDecimals(number) {
	var numSplited = number.split(".");
	try {
		return numSplited[1].length;
	} catch (e) {
		return 0;
	}
}

/*
 Displayer Functions

 Used in the 'displayErrors' function. Displayer functions
 help to display the error for the given solVersion.
*/

function palceholderDisplayer(messageObject){
	messageObject.element.placeholder = messageObject.message;
}

function errorDisplayer(messageObject) {
	// Check if error displayer div exists,
	// and create it if it doesn't
	if(!errorListElement) {
		errorListElement = document.createElement("ul");
		errorListElement.id = errorListId;
		currentForm.appendChild(errorListElement);

	}

	// Add messages to error displayer div
	errItem = document.createElement("li");
	errItem.innerHTML = messageObject.message;
	errorListElement.appendChild(errItem);
}

function tooltipDisplayer(messageObject) {
	var elem = messageObject.element;
	// var tooltip = "<span class='"+solTooltipClass+"' title='"
	// 			  +messageObject.message+"'>&otimes;</span>";
	var tooltip = document.createElement("span");
	tooltip.className = solTooltipClass;
	tooltip.setAttribute("title", messageObject.message);
	tooltip.innerHTML = "&otimes;";

	$(elem).after(tooltip);
	tooltipElements.push(tooltip);
}

/* 
 Time format checker

 Checks whenever a date format is valid
 or not comparing it with the formats
 given in the sol-input_formats attribute.

 dFormat -- valid input format
 dValue -- date value from the date field
*/
function strftimeChecker(dFormat, dValue) {
	var chIndex = 0;
	var dFormatArray = [];

	// Go through each character and
	// put them on an array
	while (chIndex < dFormat.length) {
		if (dFormat[chIndex] == '%') {
			dFormatArray.push(dFormat[chIndex] + dFormat[chIndex+1]);
			chIndex += 2;
		} else {
			dFormatArray.push(dFormat[chIndex]);
			chIndex++;
		}
	}

	// Create the data format regex pattern
	var patt = "";
	var formatReg = "";

	for (var i = 0; i < dFormatArray.length; i++) {
		var ch = dFormatArray[i];
		// Check if its a strftime character
		if (ch.startsWith("%")) {
			// Find which character it is, and add
			// the returned pattern to the formatReg
			patt = strftimePattern(ch);
			formatReg += patt;
		} else {
			// Add t regex since it's not
			// a strftime character
			formatReg += ch;
		}
	}

	// Check if value matches regex pattern
	var regObj = new RegExp(formatReg);
	return regObj.test(dValue);
}

/*
 Returns a regex pattern for the
 given strftime character.
*/
function strftimePattern(ch) {
	var pattern = '';

	switch (ch) {
		// Weekday as locale’s abbreviated name.
		case "%a":
			pattern = "(Mon|Tue|Wed|Thu|Fri|Sat|Sun)";
			break;
		// Weekday as locale’s full name.
		case "%A":
			pattern = "(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)";
			break;
		// Weekday as a decimal number, where 0 is Sunday and 6 is Saturday.
		case "%w":
			pattern = "[0-6]";
			break;
		// Day of the month as a zero-padded decimal number.
		case "%d":
			pattern = "([1-9]|2\\d|3[0-1])";
			break;
		// Month as locale’s abbreviated name.
		case "%b":
			pattern = "(Jan|Feb|Mar|Apr|May|June|July|Aug|Sept|Oct|Nov|Dec)";
			break;
		// Month as locale’s full name.
		case "%B":
			pattern = "(January|February|March|April|May|June|July|"
					  "August|September|October|November|December)";
			break;
		// Month as a zero-padded decimal number.
		case "%m":
			pattern = "(0[1-9]|1[0-2])";
			break;
		// Year without century as a zero-padded decimal number.
		case "%y":
			pattern = "(0?[1-9]|[1-9][0-9])";
			break;
		// Year with century as a decimal number.
		case "%Y":
			pattern = "[0-9]{4}";
			break;
		// Hour (24-hour clock) as a zero-padded decimal number.
		case "%H":
			pattern = "(0[1-9]|1\\d|2[0-3])";
			break;
		// Hour (12-hour clock) as a zero-padded decimal number.
		case "%I":
			pattern = "(0[1-9]|1[0-2])";
			break;
		// Locale’s equivalent of either AM or PM.
		case "%p":
			pattern = "(AM|PM|am|pm)";
			break;
		// Minute as a zero-padded decimal number.
		// Second as a zero-padded decimal number.
		case "%M":
		case "%S":
			pattern = "(0[0-9]|[1-5][0-9])";
			break;
		// Microsecond as a decimal number, zero-padded on the left.
		case "%f":
			pattern = "[0-9]{6}";
			break;
		// UTC offset in the form +HHMM or -HHMM (empty string if the the object is naive).
		case "%z":
			pattern = "([+|-][0-9]{4})?";
			break;
		// Time zone name (empty string if the object is naive).
		case "%Z":
			pattern = "(UTC|EST|CST)?";
			break;
		// Day of the year as a zero-padded decimal number.
		case "%j":
			pattern = "(00[1-9]|0\\d\\d|[1-3][1-6][1-6])";
			break;
		// 1) Week number of the year (Sunday as the first day of the week) as 
		// a zero padded decimal number. All days in a new year preceding 
		// the first Sunday are considered to be in week 0.
		// 
		// 2) Week number of the year (Monday as the first day of the week) as 
		// a decimal number. All days in a new year preceding the first Monday 
		// are considered to be in week 0.
		case "%U":
		case "%W":
			pattern = "(0[1-9]|[1-5][0-3])";
			break;
		// Locale’s appropriate date and time representation.
		case "%c":
			pattern = "(Mon|Tue|Wed|Thu|Fri|Sat|Sun) "
					  "(Jan|Feb|Mar|Apr|May|June|July|Aug|Sept|Oct|Nov|Dec) "
					  "([1-9]|2\\d|3[0-1]) ((0\\d|1\\d|2[0-3]):(0\\d|[1-5]\\d):(0\\d|[1-5]\\d)) "
					  "[0-9]{4}";
			break;
		// Locale’s appropriate date representation.
		case "%x":
			pattern = "(0[1-9]|1[0-2])/([1-9]|2\\d|3[0-1])/[0-9]{4}";
			break;
		// Locale’s appropriate time representation.
		case "%X":
			pattern = "((0\\d|1\\d|2[0-3]):(0\\d|[1-5]\\d):(0\\d|[1-5]\\d))";
			break;
		// A literal '%' character.
		case "%%":
			pattern = "%";
			break;
		default:
			pattern = "";
			break;
	}

	return pattern;
}



































