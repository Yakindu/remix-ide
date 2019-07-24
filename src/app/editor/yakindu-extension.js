'use strict'
const Range = ace.acequire('ace/range').Range

const SERVER_URL = 'ws://localhost:5007'

class YakinduLanguageServer {


    init(editor) {
        console.log('Initialization')
        this.socket = new WebSocket(SERVER_URL)
        this.socket.onmessage = function (e) { console.log(e.data); };
        this.socket.onopen = () =>
            this.socket.send(`
            {  
                "jsonrpc":"2.0",
                "id":0,
                "method":"initialize",
                "params":{  
                "rootPath":null,
                "rootUri":null,
                "capabilities":{  
                    "workspace":{  
                        "applyEdit":true,
                        "workspaceEdit":{  
                            "documentChanges":true
                        },
                        "didChangeConfiguration":{  
                            "dynamicRegistration":true
                        },
                        "didChangeWatchedFiles":{  
                            "dynamicRegistration":true
                        },
                        "symbol":{  
                            "dynamicRegistration":true,
                            "symbolKind":{  
                            "valueSet":[  
                                1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26
                                ]
                            }
                        },
                        "executeCommand":{  
                            "dynamicRegistration":true
                        },
                        "workspaceFolders":true
                    },
                    "textDocument":{  
                        "publishDiagnostics":{  
                            "relatedInformation":true
                        },
                        "synchronization":{  
                            "dynamicRegistration":true,
                            "willSave":true,
                            "willSaveWaitUntil":true,
                            "didSave":true
                        },
                        "completion":{  
                            "dynamicRegistration":true,
                            "contextSupport":true,
                            "completionItem":{  
                            "snippetSupport":true,
                            "commitCharactersSupport":true,
                            "documentationFormat":[  
                                "markdown",
                                "plaintext"
                            ],
                            "deprecatedSupport":true,
                            "preselectSupport":true
                            },
                            "completionItemKind":{  
                            "valueSet":[  
                                1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25
                              ]
                            }
                        },
                        "hover":{  
                            "dynamicRegistration":true,
                            "contentFormat":[  
                            "markdown",
                            "plaintext"
                            ]
                        },
                        "signatureHelp":{  
                            "dynamicRegistration":true,
                            "signatureInformation":{  
                            "documentationFormat":[  
                                "markdown",
                                "plaintext"
                            ]
                            }
                        },
                        "definition":{  
                            "dynamicRegistration":true
                        },
                        "references":{  
                            "dynamicRegistration":true
                        },
                        "documentHighlight":{  
                            "dynamicRegistration":true
                        },
                        "documentSymbol":{  
                            "dynamicRegistration":true,
                            "symbolKind":{  
                            "valueSet":[  
                                1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26
                             ]
                            },
                            "hierarchicalDocumentSymbolSupport":true
                        },
                        "codeAction":{  
                            "dynamicRegistration":true,
                            "codeActionLiteralSupport":{  
                            "codeActionKind":{  
                                "valueSet":[  
                                    "",
                                    "quickfix",
                                    "refactor",
                                    "refactor.extract",
                                    "refactor.inline",
                                    "refactor.rewrite",
                                    "source",
                                    "source.organizeImports"
                                ]
                            }
                            }
                        },
                        "codeLens":{  
                            "dynamicRegistration":true
                        },
                        "formatting":{  
                            "dynamicRegistration":true
                        },
                        "rangeFormatting":{  
                            "dynamicRegistration":true
                        },
                        "onTypeFormatting":{  
                            "dynamicRegistration":true
                        },
                        "rename":{  
                            "dynamicRegistration":true
                        },
                        "documentLink":{  
                            "dynamicRegistration":true
                        },
                        "typeDefinition":{  
                            "dynamicRegistration":true
                        },
                        "implementation":{  
                            "dynamicRegistration":true
                        },
                        "colorProvider":{  
                            "dynamicRegistration":true
                        },
                        "foldingRange":{  
                            "dynamicRegistration":true,
                            "rangeLimit":5000,
                            "lineFoldingOnly":true
                        }
                    }
                },
                "trace":"off",
                "workspaceFolders":null
                }
            }
            `);
    }

    didOpen(editor) {
        this.socket.send(`
        {  
            "jsonrpc":"2.0",
            "method":"textDocument/didOpen",
            "params":{  
               "textDocument":{  
                  "uri":"inmemory://demo/model.sol",
                  "languageId":"solidity-ide",
                  "version":1,
                  "text": "${editor.getValue()}"
               }
            }
         }
        `)
    }

    completions(editor, callback) {
        this.didOpen(editor)
        this.socket.onmessage = function (msg) {
            console.log('The server says: ' + msg);
            var results = JSON.parse(msg.data)['result']['items'].forEach(item => {
                callback(null, [{ name: item['label'], value: item['label'], score: 1000000, meta: 'yakindu', icon: 'unknown' }])
            });
        }
        this.socket.send(`
        {  
            "jsonrpc":"2.0",
            "id":4,
            "method":"textDocument/completion",
            "params":{  
            "textDocument":{  
                "uri":"inmemory://demo/model.sol"
            },
            "position":{  
                "line":${editor.getCursorPosition().row},
                "character":${editor.getCursorPosition().column}
            },
            "context":{  
                "triggerKind":1
            }
            }
        }
     `)
    }

    format(editor) {
        this.didOpen(editor)
        this.socket.onmessage = function (msg) {
            console.log('The server says: ' + msg.data);
            var originalText = editor.getValue()
            var formattedText = ""
            var offset = 0
            JSON.parse(msg.data)['result'].forEach(textEdit => {
                var startRange = textEdit['range']['start']
                var endRange = textEdit['range']['end']

                var startPosition = new Object()
                startPosition['row'] = startRange['line']
                startPosition['column'] = startRange['character']

                var endPosition = new Object()
                endPosition['row'] = endRange['line']
                endPosition['column'] = endRange['character']


                var startOffset = editor.session.doc.positionToIndex(startPosition)
                formattedText += originalText.substr(offset, startOffset - offset) + textEdit['newText']
                offset = editor.session.doc.positionToIndex(endPosition)

            })
            editor.setValue(formattedText + originalText.substr(offset))
        }
        this.socket.send(`
        {  
           "jsonrpc":"2.0",
           "id":4,
           "method":"textDocument/formatting",
           "params":{  
              "textDocument":{  
                 "uri":"inmemory://demo/model.sol"
              },
              "options" : {
                  "tabsize" : 4
              }
           }
        }
        `)

    }
}
module.exports = YakinduLanguageServer