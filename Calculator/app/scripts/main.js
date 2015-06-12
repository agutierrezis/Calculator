/*!
 * All Rights Reserved
 * This software is proprietary information of
 * Intelligent Sense
 * Use is subject to license terms.
 * Filename: main.js
 */

 /*
  * Author:      agutierrez@intelligentsense.com
  * Date:        11/06/2015
  * Description: Template to create javascript namespaces and modules
  */


/**
 * Namespace declaration. Use the client's name and project. 
 */  
var CalculatorNamespace = window.CalculatorNamespace || {};

/*
 * Global logic
 * @namespace
 */
(function (pContext, $) {

    'use strict';

    /**
     * Module.
     *      This module manages the calculator functions
     *
     * @private
     * @namespace
     **/
    var CalcModule = (function() {

        /// Global calculator variables
        var operationStr;
        var result;
        var operationRegex;
        var operandRegex;
        var operatorRegex;

        /**
         * This function resets the calculator values
         * @return
         * @private
         */
        function restartValues() {
            operationStr = '';
            result = 0;
        }
        
        /**
         * This function resgisters the buttons events
         * @return
         * @private
         */
        function registerButtomsEvents() {
            // Input buttoms events on click
            $('.input').on('click', function() {
                var op = $(this).data('value');
                doOperation(op);
            });

            // Clear buttom event
            $('#btnC').on('click', function() {
                restartValues();
                display();
            });

            // Result buttom event
            $('#btnEquals').on('click', function() {
                operationStr = result.toString();
                display();
            });
        }

        /**
         * This function do the entire operation
         * @param  {String} op The operation string to calculate
         * @return
         * @private
         */
        function doOperation(op) {
            
            // Gets operation string to validate before do the calculation
            var operationToValidate = operationStr;
            if(op === '.' && (operationStr.length === 0 || 
                            operationStr.slice(-1) === '×' || 
                            operationStr.slice(-1) === '÷' || 
                            operationStr.slice(-1) === '+' || 
                            operationStr.slice(-1) === '-')) {
                op = '0.';
            }
            operationToValidate += op;

            // Validates whether the operation to try to calculate is syntactically correct
            if(validateOperation(operationToValidate)){
                // If valid, overwrite the operation string
                operationStr = operationToValidate;
            }
            else {
                // If not valid, sends a error message
                alert('Invalid character inserted');
            }

            // Calculates the operations and displays it to the screen
            display();
        }

        /**
         * This function calculates the operation and displays it on the screen
         * @return
         * @private
         */
        function display() {
            if (operationStr === '') {
                $('#operationContent').text(operationStr);
                $('#resultContent').text('0');
                return;
            }

            result = calculate();
            $('#operationContent').text(operationStr);
            $('#resultContent').text(result);
        }

        /**
         * This function validates whether the operations is syntactically correct
         * @param  {String} operationToValidate The operations string to validate
         * @return {boolean}                    Indicates whether the operation is correct or not
         * @private
         */
        function validateOperation(operationToValidate) {

            var operationToMatch = getOperationToMatch(operationToValidate);

            if (operationToMatch === '') {
                return true;
            }

            var opMatch = operationToMatch.match(operationRegex);

            if(opMatch !== null && opMatch.length === 1 && opMatch[0] === operationToMatch) {
                return true;
            }

            return false;
        }

        /**
         * This function gets the operation to match with the regex, this is, if
         * the operations ends with '.', '×', '÷', '+' or '-', it ignores that character
         * @param  {String} initialOperation The operation string to evaluate
         * @return {String}                  The operation result
         * @private
         */
        function getOperationToMatch(initialOperation) {
            var result = initialOperation;
            if (result.length > 0 && (
                result.slice(-1) === '.' ||
                result.slice(-1) === '×' ||
                result.slice(-1) === '÷' ||
                result.slice(-1) === '+' ||
                result.slice(-1) === '-')) {
                result = result.slice(0, -1);
            }
            return result;
        }

        /**
         * This function takes the operations string, splits it and finally gets the
         * calculation result
         * @return {Number} The calculation result
         * @private
         */
        function calculate() {
            // Gets the operation in a correct format to operate
            var operationToCalculate = getOperationToMatch(operationStr);

            // If the operations isn't an empty string...
            if(operationToCalculate !== '')
            {
                // Gets the operands and operators
                var operands = operationToCalculate.split(operatorRegex);
                var operators = operationToCalculate.split(operandRegex);

                // Gets only valid operators
                var opCount = operators.length;
                for(var index = 0; index < opCount; index++) {
                    var value = operators[index];
                    if (value !== '×' && value !== '÷' && value !== '+' && value !== '-') {
                        operators.splice(index, 1);
                        index--;
                        opCount--;
                    }
                }

                // For negatives values
                if (operands[0] === '') {
                    operands[0] = '0';
                }

                // Returns the calculation
                return getCalc(operands, operators);
            }

            return 0;
        }

        /**
         * This functions gets the calculation from the operands and operators arrays
         * @param  {Array} operands  Operands of the operation
         * @param  {Arrat} operators Operators of the operation
         * @return {Number}          The final result
         */
        function getCalc(operands, operators) {
            var result = 0;
            var operatorsCount = operators.length;
            for (var opIndex = 0; opIndex < operatorsCount; opIndex++) {
                var indexMult = operators.indexOf('×');
                var indexDiv = operators.indexOf('÷');

                // Do Mult
                if(indexMult > -1 && (indexDiv === -1 || (indexMult < indexDiv && indexDiv !== -1))) {
                    operands[indexMult] = Number(operands[indexMult]) * Number(operands[indexMult + 1]);
                    operands.splice(indexMult + 1, 1);
                    operators.splice(indexMult, 1);
                    opIndex--;
                    operatorsCount--;
                    continue;
                }
                // Do Div
                if (indexDiv > -1 && (indexMult === -1 || (indexDiv < indexMult && indexMult !== -1))) {
                    operands[indexDiv] = Number(operands[indexDiv]) / Number(operands[indexDiv + 1]);
                    operands.splice(indexDiv + 1, 1);
                    operators.splice(indexDiv, 1);
                    opIndex--;
                    operatorsCount--;
                    continue;
                }

                var indexSum = operators.indexOf('+');
                var indexDif = operators.indexOf('-');

                // Do Sum
                if (indexSum > -1 && (indexDif === -1 || (indexSum < indexDif && indexDif !== -1))) {
                    operands[indexSum] = Number(operands[indexSum]) + Number(operands[indexSum + 1]);
                    operands.splice(indexSum + 1, 1);
                    operators.splice(indexSum, 1);
                    opIndex--;
                    operatorsCount--;
                    continue;
                }
                // Do Dif
                else {
                    operands[indexDif] = Number(operands[indexDif]) - Number(operands[indexDif + 1]);
                    operands.splice(indexDif + 1, 1);
                    operators.splice(indexDif, 1);
                    opIndex--;
                    operatorsCount--;
                    continue;
                }
            }

            if (operands.length === 1) {
                result = operands[0];
            }

            return result;
        }

        /**
         * Init the module.
         * @public
         */
        function init() {
            // Initializes the regular expressions
            operationRegex = /(-)?\d+(\.\d+)?((×|÷|\+|-)\d+(\.\d+)?)*/g;
            operandRegex = /\d+(\.\d+)?/;
            operatorRegex = /×|÷|\+|-/;

            // Reset values and displays them
            restartValues();
            display();

            // Registers buttons events
            registerButtomsEvents();
        }

        // Return the public methods of the module so that they are accessible outside this context. 
        return {
            init : init
        };
    })();


    /**
     * Initializes the module.
     * @private
     */
    function init() {
        //Called the methods required to initialize all the modules.
        CalcModule.init();
    }

    //Init.
    $(init);

}(CalculatorNamespace, jQuery));
