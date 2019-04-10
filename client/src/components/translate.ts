

/**
 * Translates an .xlf file from one language to another
 * @param {string} input The source of the .xlf file, as a string
 * @param {string} from The language code of the input file
 * @param {string} to The language code of the output file
 */
function translate(input: string, from: string, to: string) {
    const googleTranslate = require('@vitalets/google-translate-api');
    const bluebird = require('bluebird');
    const xml2js = bluebird.promisifyAll(require('xml2js'));
    const _ = require('lodash');

    return xml2js
        .parseStringAsync(input)
        .then((parsedXlf: any) => {
            const allPromises: any[] = [];

            const translateObj = (xlfObj: any) => {
                _.forOwn(xlfObj, (value: any, key: string) => {
                    if (key.trim().toLowerCase() === 'source') {
                        // if there's a "source" key in this object,
                        // translate the value (value[0]) of this property
                        // and add the translation into a
                        // sibling "target" element

                        let textToTranslate: string;

                        if (_.isString(value[0])) {
                            // if the value of the node is just a string,
                            // easy - this is the text we want to translate
                            textToTranslate = value[0];
                        } else if (_.isObject(value[0]) && value[0]['_']) {
                            // if the value of the node is an object with
                            // an _ property, we want to translate the
                            // value of the _ property.
                            textToTranslate = value[0]['_'];
                        }

                        // translating complex scenarios
                        // (i.e. {VAR_PLURAL, plural, =0 {just now} etc...})
                        // is not yet supported by this utility.  If we encounter
                        // this, simply create a "target" element that is an exact
                        // duplicate of the "source" element, so that the users
                        // will at least get the input language's translation.
                        if (
                            _.isNil(textToTranslate) ||
                            /\{|\}/.test(textToTranslate)
                        ) {
                            xlfObj['target'] = _.cloneDeep(value);
                        } else {
                            // call the Google Translate endpoint, log the
                            // translation to the console, and replace the
                            // property's value with the translation
                            
                            setTimeout(() => {
                                    
                            }, 200);
                            const translatePromise = googleTranslate(
                                textToTranslate,
                                {
                                    from: from,
                                    to: to
                                }
                            ).then((res: any) => {
                                // update the object with the translation,
                                // make sure to match the format of the
                                // original <source> element
                                if (_.isString(value[0])) {
                                    xlfObj['target'] = res.text;
                                } else if (
                                    _.isObject(value[0]) &&
                                    value[0]['_']
                                ) {
                                    xlfObj['target'] = _.cloneDeep(value);
                                    xlfObj['target'][0]['_'] = res.text;
                                }
                            })
                            .catch((err:any) => {
                                console.log(err);
                            });

                            allPromises.push(translatePromise);
                        }
                    } else if (_.isObject(value) || _.isArray(value)) {
                        // if the value of this project is another
                        // object or an array, recursively search this
                        // sub-object for "source" properties

                        translateObj(value);
                    }
                });
            };

            // kick off the recursive process
            translateObj(parsedXlf);

            // wait until all the translations have finished processing,
            // then return the modified .xlf JSON object
            return bluebird.all(allPromises).then(() => {
                return parsedXlf;
            });
        })
        .then((parsedXlf: any) => {
            // convert the .xlf JSON object into
            // an actual .xlf file string
            const builder = new xml2js.Builder();
            return builder.buildObject(parsedXlf);
        });
}

module.exports = translate;