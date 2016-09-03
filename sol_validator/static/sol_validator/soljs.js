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
			} else if (attrName == "sol-maxlength") {
				if (formElem.value.length > attrValue) {
					message = elemName + " maximum length: " + attrValue;
					elemSuccess = false;
				}
			} else if (attrName == "sol-minlength"){
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
				var dt = new Date(formElem.value);
				if (dt == "Invalid Date") {
					message = elemName + " invalid format: " + formElem.value;
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
	numSplited = number.split(".");
	return numSplited[1].length;
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