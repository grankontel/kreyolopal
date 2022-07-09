/**
 *  Wabap — v1.0.0
 *  API used to manage the Wabap dictionary.
 *  Copyright 2017 Lanookaï, all rights reserved.
 */

 'use strict'

 const _ = require('lodash')
 const Redis = require("ioredis");
 
 /*
     LES ÉTAPES D'UNE RECHERCHE :
 
     1. On saisit les premières lettres d'un mot (dans une langue prédéfinie) : 
 
         a. Le client envoie au serveur le mot saisi (partiel ou complet) ;
 
         b. Le serveur convertit le mot reçu en clef d'index (en anglais, 
            "searching form" word), en appliquant plusieurs filtres :
 
             - suppression des caractères diacritiques (les accents),
             - mise en minuscules,
             - suppression des caractères invisibles,
             - suppression des espaces inutiles (en début de mot, 
               en fin de mot et les multiples espaces consécutifs),
             - transcription phonétique conventionnelle, dans chaque langue 
               (par exemple, GP : iy, yi, y ==> i ; MQ : ... ; EN : ... ; FR : ...),
               avec exclusion possible de certaines langues selon les paramètres 
               (par exemple, transcription phonétique uniquement pour les créoles).
         
             Par exemple, le mot "abityé" en créole Guadeloupéen, a 6 clef d'index :
             "a", "ab", "abi", "abit", "abiti", "abitie". Chacune d'elles a comme
             valeur une liste de graphies (c-à-d, un tableau de chaînes), au format
             JSON.
             Ainsi, la clef "abi" (en réalité "IDX:gp:abi") contient la valeur
             suivante (l'aperçu a été désérialisé, pour une question de lisibilité) :
 
             IDX:gp:abi: [
                 { id:"2", wfs:["abityé", ...] },
                 { id:"3", wfs:["abiyé", ...]  },
                 { id:"4", wfs:["abizan", ...] }
             ]
             
 
         c. Le serveur recherche les clef d'articles associées à la clef d'index :
 
             Pour chacune des langues souhaitées, le serveur "interroge" la clef d'index,
             pour récupérer la liste de clef d'articles. 
             Une clef d'article est un objet javascript sérialisé (au format JSON,
             donc, une chaîne de caractères), avec la structure suivante :
 
             {"<idArticle>":"[<graphie>, <graphie>, <graphie>, ...]"}
 
             La graphie d'un mot (en anglais "written form" word) est une proposition 
             d'orthographe d'un mot, auquel les filtres suivants ont été appliqués :
 
             - mise en minuscules,
             - suppression des caractères invisibles,
             - suppression des espaces inutiles (en début de mot,
               en fin de mot et les espaces multiples consécutifs).
 
         d. Le serveur renvoie les clef d'articles regroupées par article et par langue
 
             Pour chaque langue souhaitée, le serveur regroupe les graphies
             par article, comme dans l'exemple suivant (où la propritété "id"
             indique l'identifiant de l'article et "wfs" — qui signifie 
             "written forms" — indique un tableau de graphies) :
 
             {
                 "GP": [
                     { "id": "152", "wfs": ["ababa", "abazoudi", "abi", ...] },
                     ...
                 ],
                 "MQ": [
                     ...
                 ]
             }
 
     2. (Re)création de la base de données (en ligne de commande uniquement)
 
         a. Suppression du contenu de la base de données (FLUSHALL)
         b. Affectation d'un numéro d'identification (id) pour chaque article
         c. Enregistrement de chaque article avec l'étiquette "ART:<id>"
         d. Indexation des articles :
             a. Création des clef de l'article (pour chaque graphie)
             b. Création/mise à jour des clef d'index
 
 
 
     Remarques :
     
     Les formes indexées, les graphies et les définitions créées sont systématiquement mémorisées dans la base de données "draft"
     (brouillon) et ne sont pas accessibles au public. Une fois validées, elle sont transférées dans la base de données "final".
     Toute modification d'une forme indexée, d'une graphie ou d'une définition validée, entraîne tout d'abord sa copie dans la base "draft" ;
     les modifications s'effectuent alors sur la copie. Lorsque la modification est validée, elle est transférée dans la base de données
     "final" et remplace l'ancienne version.
 
     Des bases de données spécifiques intitulées "draft_test" et "final_test" sont définies pour y mener toute sorte de tests unitaire
     et fonctionnelle.
 
     Pour chaque action effectuée sur le dictionnaire (tant par un utilisateur qui effectue une recherche, qu'un administrateur
     qui ajoute, modifie ou supprime une entrée et/ou une définition), il faut implémenter un déclecheur (trigger).
     De plus, il faudrait créer une extension de l'application (ou une autre application) qui attacherait un gestionnaire d'évènements 
     à chacun de ces déclencheurs, pour créer un historique. Cet historique mémoriserait donc dans une base de données séparée du dictionnaire,
     les actions, les dates et heures de ces actions et la provenance des requêtes.
     Cette seconde application pourrait — dans un second temps —, intégrer une API pour extraire des statistiques de cet historique (comme
     par exemple, l'usage des différentes graphies, ...). Lanookaï pourrait alors proposer ses services pour fournir moyennant paiement
     à des instituts de sondage, des statistiques sur mesure. Il faudrait réfléchir aussi à la possibilité de mettre à la disposition
     des chercheurs en linguistique, des outils d'interrogation (comment fournir des outils gratuits pour les chercheurs, de manière
     à inciter le monde de la recherche à utiliser le dictionnaire ?).
 
 
     Interface Rédacteur :
     ---------------------
 
     (GP)
 
     (graphie 1, usage, localisation) (graphie 2, usage, localisation) ...
 
     (FR)
     1. (nature) Explication en français avec les mots français équivalents en gras (et éventuellement du créole en italique et les graphies en italique gras)
        Exemples: 
        • Phrase en créole : traduction en français
        • Phrase en créole : traduction en français
        • ...
 
        Synonymes:
        (graphie 1, usage, localisation) (graphie 2, usage, localisation) ...
 
     1. (nature) Explication en français avec les mots français équivalents en gras (et éventuellement du créole en italique et les graphies en italique gras)
        Exemples: 
        • Phrase en créole : traduction en français
        • Phrase en créole : traduction en français
        • ...
 
        Synonymes:
        (graphie 1, usage, localisation) (graphie 2, usage, localisation) ...
 
     ...
 
     Structure des donnnées de la base (exemple) :
     --------------------------------------------
 
     draft:
       entry: [
         {
           _id: ...
           searchingForm: ...
           writtenForm: ...
           natures: [
             nature: ... (article, nom, verbe, pronom (possessif, personnel, interrogatif), onomatopée)
             usage: ...
             definitionId: ...
           ]
           synonyms: []
         }
       ]
 
       definition:(id) {
         nature: .... (article, nom, verbe, pronom (possessif, personnel, interrogatif), onomatopée)
       }
 
       
         sf: (index)
         d: (definition)
 
     Exemple:
 
     d:i:cre:
         words: [
             { sf:crepe,  {crêpe},
             creme {crème},
             creve {
                 { wf: crève, usages: ["~ avec"; "~ sur"] },
                 { wf: crevé, usages: [] }
 
     d:d:creve:
         - crève {}
         - crevé {}
 
     f: (final)
 
     dt: (draft test)
 
     ft: (final test)
 
     
 */
 
 /**
  * [Wabap description]
  * @param {Object} Wabap options :
  *
  * dbConnection:  (object)  Database connection information ;
  * - host:        (string)  Database server host name ;
  * - port:        (string)  Database server port ;
  * - password:    (string)  Database server credential ;
  * - db:          (integer) Database ID (0-16).
  *
  */
 module.exports = options => {
   let _this = this
 
   // See http://web.archive.org/web/20120918093154/http://lehelk.com/2011/05/06/script-to-remove-diacritics
   const DEFAULT_DIACRITICS_REMOVAL_MAP = [
       {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
       {'base':'AA','letters':/[\uA732]/g},
       {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
       {'base':'AO','letters':/[\uA734]/g},
       {'base':'AU','letters':/[\uA736]/g},
       {'base':'AV','letters':/[\uA738\uA73A]/g},
       {'base':'AY','letters':/[\uA73C]/g},
       {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
       {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
       {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
       {'base':'DZ','letters':/[\u01F1\u01C4]/g},
       {'base':'Dz','letters':/[\u01F2\u01C5]/g},
       {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
       {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
       {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
       {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
       {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
       {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
       {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
       {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
       {'base':'LJ','letters':/[\u01C7]/g},
       {'base':'Lj','letters':/[\u01C8]/g},
       {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
       {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
       {'base':'NJ','letters':/[\u01CA]/g},
       {'base':'Nj','letters':/[\u01CB]/g},
       {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
       {'base':'OI','letters':/[\u01A2]/g},
       {'base':'OO','letters':/[\uA74E]/g},
       {'base':'OU','letters':/[\u0222]/g},
       {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
       {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
       {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
       {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
       {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
       {'base':'TZ','letters':/[\uA728]/g},
       {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
       {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
       {'base':'VY','letters':/[\uA760]/g},
       {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
       {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
       {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
       {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
       {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
       {'base':'aa','letters':/[\uA733]/g},
       {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
       {'base':'ao','letters':/[\uA735]/g},
       {'base':'au','letters':/[\uA737]/g},
       {'base':'av','letters':/[\uA739\uA73B]/g},
       {'base':'ay','letters':/[\uA73D]/g},
       {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
       {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
       {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
       {'base':'dz','letters':/[\u01F3\u01C6]/g},
       {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
       {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
       {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
       {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
       {'base':'hv','letters':/[\u0195]/g},
       {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
       {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
       {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
       {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
       {'base':'lj','letters':/[\u01C9]/g},
       {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
       {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
       {'base':'nj','letters':/[\u01CC]/g},
       {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
       {'base':'oi','letters':/[\u01A3]/g},
       {'base':'ou','letters':/[\u0223]/g},
       {'base':'oo','letters':/[\uA74F]/g},
       {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
       {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
       {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
       {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
       {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
       {'base':'tz','letters':/[\uA729]/g},
       {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
       {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
       {'base':'vy','letters':/[\uA761]/g},
       {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
       {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
       {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
       {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
   ]
 
   // Private properties
 
   let _dbCon
   let _redis
 
 
   // Beginning of test data
   // ----------------------
   const TEST_MODE = false      // set tests ON (true) / OFF (false)
   let _test = {
     // Redis test connection.
     redis: undefined,
 
     // Tests for the setArticle() method.
     setArticle: {
       articleId: 126,
       howManyDisruptions: 4,
       disruptionsIndex: 0
     },
 
     // Tests for setArticleIndices() methid.
     setArticleIndices: {
       // TODO...
     }
   }
   // End of test data
   // ----------------------
     
   // Public methods
 
   /**
    * localFilters(language)
    *
    * Returns the predefined filters (the searching filters 
    * and the ordering filters) that match the specified language.
    * 
    * @param  {string}   The language that identifies the filters.
    * @return {object}   An object that contains two properties:
    *                       the 'searchingFilters' and 'orderingFilters'
    *                       properties, each of which contains the filters
    *                       that can be provided to the Wabap.filterWord()
    *                       method.
    */
   Object.defineProperty( _this, 'localFilters', {
     get: function() {
       return function( language ) {
         const lang = language.toLowerCase()
 
         switch( lang ) {
           case 'gp':  // Guadeloupean Creole
             return {
               searchingFilters: {
                 diacriticsCharactersRemoval:        true,
                 nonPrintingCharactersRemoval:       true,
                 leftAndRightSpaceCharactersRemoval: true,
                 consecutiveSpaceCharactersRemoval:  true,
                 hyphenCharactersRemoval:            true,
                 exclamationPointsRemoval:           true,
                 interrogationPointsRemoval:         true,
                 ponctuationsRemoval:                true,
                 allSpaceCharactersRemoval:          true,
                 downcaseTransformation:             true,
                 phoneticTransformation:             [
                                                       {regx:/iy|yi/g, to:'i'},
 
                                                       {regx:/[^cs]ha/g, to:'a'},
                                                       {regx:/[^cs]he/g, to:'e'},
                                                       {regx:/[^cs]hi/g, to:'i'},
                                                       {regx:/[^cs]ho/g, to:'o'},
                                                       {regx:/[^cs]hu/g, to:'u'},
 
                                                       {regx:/ca/g,      to:'ka'},
                                                       {regx:/co/g,      to:'ko'},
                                                       {regx:/cu/g,      to:'ku'},
                                                     ],
                 duplicationsRemoval:                true,
               },
               orderingFilters: {
                 diacriticsCharactersRemoval:        true,
                 nonPrintingCharactersRemoval:       true,
                 leftAndRightSpaceCharactersRemoval: true,
                 consecutiveSpaceCharactersRemoval:  true,
                 hyphenCharactersRemoval:            true,
                 exclamationPointsRemoval:                 false,
                 interrogationPointsRemoval:               false,
                 ponctuationsRemoval:                true,
                 allSpaceCharactersRemoval:          true,
                 downcaseTransformation:             true,
                 phoneticTransformation:                   [],
                 duplicationsRemoval:                true,
               }
             }
           default:
             console.warn( language ?
               `Unsupported language ("${language}")` :
               `localFilters(language) : No language specified ; returns the default filters.`
             )
             return {
               searchingFilters: {
                 diacriticsCharactersRemoval:        true,
                 nonPrintingCharactersRemoval:       true,
                 leftAndRightSpaceCharactersRemoval: true,
                 consecutiveSpaceCharactersRemoval:  true,
                 hyphenCharactersRemoval:            true,
                 exclamationPointsRemoval:           true,
                 interrogationPointsRemoval:         true,
                 ponctuationsRemoval:                true,
                 allSpaceCharactersRemoval:          true,
                 downcaseTransformation:             true,
                 phoneticTransformation:                   {},
                 duplicationsRemoval:                true,
               },
               orderingFilters: {
                 diacriticsCharactersRemoval:              false,
                 nonPrintingCharactersRemoval:       true,
                 leftAndRightSpaceCharactersRemoval: true,
                 consecutiveSpaceCharactersRemoval:  true,
                 hyphenCharactersRemoval:            true,
                 exclamationPointsRemoval:           true,
                 interrogationPointsRemoval:         true,
                 ponctuationsRemoval:                true,
                 allSpaceCharactersRemoval:          true,
                 downcaseTransformation:             true,
                 phoneticTransformation:                   {},
                 duplicationsRemoval:                true,
               }
             }
         }
       }
     }
   })
      
   /**
    * filterWord(word [, filters])
    *
    * Returns the filtered word.
    * This method is useful for getting a word in a searching form,
    * from its written form. The filters argument is optional ; if not defined, 
    * this method applies the filters passed to the constructor, or if none,
    * the default ones.
    * Here is the list of available filters :
    *
    *  • diacriticsCharactersRemoval: true,          Enable diacritics removal
    *  • nonPrintingCharactersRemoval: true,         Enable non-printing characters removal
    *  • leftAndRightSpaceCharactersRemoval: true,   Enable left and right spaces removal (ie, trim)
    *  • consecutiveSpaceCharactersRemoval: true,    Enable multiple consecutive spaces removal
    *  • hyphenCharactersRemoval: true,              Enable hyphen character removal (trait d'union, in French)
    *  • exclamationPointsRemoval: true,             Enable exclamation points removal
    *  • interrogationPointsRemoval: true,           Enable interrogation points removal
    *  • ponctuationsRemoval: true,                  Enable [.], [,], [;], [:] removal
    *  • allSpaceCharactersRemoval: true,            Enable the all space characters removal
    *  • downcaseTransformation: true,               Enable down case transformation
    *  • phoneticTransformation: 'gp',               Enable Guadeloupean Creole phonetic transformation
    *  • duplicationsRemoval: true                   Enable duplicated consecutive characters removal
    *
    */
   Object.defineProperty( _this, 'filterWord', {
     get: function() {
       return function( string, filters ) {
         let str = string
         let f = filters || {}
 
         if ( typeof str !== 'string' ) {
           return undefined
         }
 
         if ( f.hasOwnProperty('diacriticsCharactersRemoval') ) {
           str = f.diacriticsCharactersRemoval ? removeDiacriticCharacters( str ) : str
         } //else console.warn('filterWord() : no diacriticsCharactersRemoval filter')
 
         if ( f.hasOwnProperty('nonPrintingCharactersRemoval') ) {
           str = f.nonPrintingCharactersRemoval ? removeNonPrintingCharacters( str ) : str
         } //else console.warn('filterWord() : no nonPrintingCharactersRemoval filter')
 
         if ( f.hasOwnProperty('leftAndRightSpaceCharactersRemoval') ) {
           str = f.leftAndRightSpaceCharactersRemoval ? removeLeftAndRightSpaceCharacters( str ) : str
         } //else console.warn('filterWord() : no leftAndRightSpaceCharactersRemoval filter')
 
         if ( f.hasOwnProperty('consecutiveSpaceCharactersRemoval') ) {
           str = f.consecutiveSpaceCharactersRemoval ? removeConsecutiveSpaceCharacters( str ) : str
         } //else console.warn('filterWord() : no consecutiveSpaceCharactersRemoval filter')
 
         if ( f.hasOwnProperty('hyphenCharactersRemoval') ) {
           str = f.hyphenCharactersRemoval ? removeHyphenCharacters( str ) : str
         } //else console.warn('filterWord() : no hyphenCharactersRemoval filter')
 
         if ( f.hasOwnProperty('exclamationPointsRemoval') ) {
           str = f.exclamationPointsRemoval ? removeExclamationPoints( str ) : str
         } //else console.warn('filterWord() : no exclamationPointsRemoval filter')
 
         if ( f.hasOwnProperty('interrogationPointsRemoval') ) {
           str = f.interrogationPointsRemoval ? removeInterrogationPoints( str ) : str
         } //else console.warn('filterWord() : no interrogationPointsRemoval filter')
 
         if ( f.hasOwnProperty('ponctuationsRemoval') ) {
           str = f.ponctuationsRemoval ? removePonctuations( str ) : str
         } //else console.warn('filterWord() : no ponctuationsRemoval filter')
 
         if ( f.hasOwnProperty('allSpaceCharactersRemoval') ) {
           str = f.allSpaceCharactersRemoval ? removeAllSpaceCharacters( str ) : str
         } //else console.warn('filterWord() : no allSpaceCharactersRemoval filter')
 
         if ( f.hasOwnProperty('downcaseTransformation') ) {
           str = f.downcaseTransformation ? setToLowerCaseCharacters( str ) : str
         } //else console.warn('filterWord() : no downcaseTransformation filter')
 
         if ( f.hasOwnProperty('phoneticTransformation') ) {
           str = f.phoneticTransformation ? transformPhonems( f.phoneticTransformation, str ) : str
         } //else console.warn('filterWord() : no phoneticTransformation filter')
 
         if ( f.hasOwnProperty('duplicationsRemoval') ) {
           str = f.duplicationsRemoval ? removeDuplicates( str ) : str
         } //else console.warn('filterWord() : no duplicationsRemoval filter')
         
         function removeDiacriticCharacters( str ) {
           for( var i = 0 ; i < DEFAULT_DIACRITICS_REMOVAL_MAP.length ; i++ ) {
             str = str.replace( DEFAULT_DIACRITICS_REMOVAL_MAP[i].letters, DEFAULT_DIACRITICS_REMOVAL_MAP[i].base )
           }
           return str
         }
         
         // [\r] and [\n]
         function removeNonPrintingCharacters( str ) {
           return str.replace(/[\t\x0D\x0A]/g, '')
         }
         
         // [ ], [\t], [\r] and [\n]
         function removeLeftAndRightSpaceCharacters( str ) {
           return str.match(/^[\s]*(.*?)[\s]*$/)[1]
         }
         
         // [  ] => [ ]
         function removeConsecutiveSpaceCharacters( str ) {
           return str.replace(/\s{2,}/g, ' ')
         }
         
         // [-] => empty string
         function removeHyphenCharacters( str ) {
           return str.replace(/-/g, '')
         }
         
         // [!] => empty string
         function removeExclamationPoints( str ) {
           return str.replace(/!/g, '')
         }
         
         // [?] => empty string
         function removeInterrogationPoints( str ) {
           return str.replace(/\?/g, '')
         }
         
         // [.], [;], [,] or [:] => empty string
         function removePonctuations( str ) {
           return str.replace(/[\.;,:]/g, '')
         }
         
         // [ ] => empty string
         function removeAllSpaceCharacters( str ) {
           return str.replace(/ /g, '')
         }
         
         // [A-Z] => [a-z]
         function setToLowerCaseCharacters( str ) {
           return str.toLowerCase( )
         }
 
         // an array of objects, each of which has a regular
         // expression and a string that must replace matched items
         function transformPhonems( tranformations, str ) {
           for( let tranformation of tranformations ) {
             const regx = tranformation.regx
             const to = tranformation.to
             if ( regx instanceof RegExp && typeof to === 'string' ) {
               str = str.replace(regx, to)
             }
           }
           return str
         }
 
         // Example: [aa] => [a]
         function removeDuplicates( str ) {
           return str.replace(/(.)(?=\1+)/g, '')
         }
         
         return str
       }
     }
   })
 
   // ----------------------------
   // Article & indices management
   // ----------------------------
 
   /**
    * import( articles, eventHandler )
    *
    * Imports an array of articles into Redis.
    * 
    * @param {object}      articles     an array of article objects.
    * @param {function}    eventHandler callback with the progress as argument 
    *                                   (in purcentage). This callback is 
    *                                   optional.
    * @return {Promise}     the import promise.
    */
   Object.defineProperty( _this, 'import', {
     get: function() {
       return function( articles, eventHandler ) {
         return new Promise( (resolve, reject) => {
           let index = 0
           let lastProgress = -1
 
           let callEventHandler = function(  ) {
             if ( eventHandler ) {
               const newProgress = Math.floor( 100*index/articles.length )
               if ( newProgress !== lastProgress ) {
                 lastProgress = newProgress
                 eventHandler( newProgress )
               }
             }
           }
 
           let processArticle = function() {
             return new Promise( (resolve, reject) => {
               let article = articles[index]
 
               // informs the avent handler of the progression
               callEventHandler( )
 
               // creates the article at "ART:<article ID>"
               _this.setArticle( article )
               .then( () => {
                 resolve( )
               })
               .catch( err => {
                 reject( err )
               })
             })
           }
 
           let processNextArticle = function() {
             return new Promise( (resolve, reject) => {
               if (index === articles.length) {
                 resolve()
                 return
               }
               processArticle()
               .then( () => {
                 index += 1
 
                 processNextArticle()
                 .then( () => {
                   resolve()
                 })
                 .catch( err => {
                   reject( err )
                 })
               })
               .catch( err => {
                 reject( err )
               })
             })
           }
 
           processNextArticle( )
           .then( () => {
             callEventHandler( )
             resolve()
           })
           .catch( err => {
             reject( err )
           })
         })
       }
     }
   })
 
   /**
    * Inserts the article to the database
    * 
    * Gets a unique ID from Redis and sets it to the article. 
    * Then inserts the article at the key "ART:<ID>", in JSON.
    * 
    * @param {Object} article The article to add.
    * @returns {Promise} A Promise object.
    */
   Object.defineProperty( _this, 'setArticle', {
     get: function( ) {
       return function( article ) {            // Async with Promise
         return new Promise( (resolve, reject) => {
 
           const normalizeArticle = function( article ) {
             let art = article
 
             // normalize the wfs array content
             for( let i in art.wfs) {
               art.wfs[i] = _this.filterWord( art.wfs[i], {
                 nonPrintingCharactersRemoval:       true,
                 leftAndRightSpaceCharactersRemoval: true,
                 consecutiveSpaceCharactersRemoval:  true
               })
             }
 
             // TODO...
 
             return art
           }
           const tryToSetArticle = function( art ) {
             return new Promise( (resolve, reject) => {
               const article = normalizeArticle(art)
 
               // check if nobody changes this article in Redis
               // until we execute the pipeline ; else we retry.
               _redis.watch( `ART:${article.id}` )
 
               // -------------------- TEST ------------------------
               // adds some disruptions on setting the article
               // identified by _test.setArticle.articleId, for
               // a number of times defined by
               // _test.setArticle.howManyDisruptions.
               // Check the test state by reading the value at key
               // 'ART:<_test.setArticle.articleId>' ; if it contains
               // the object {test:"failed"}, then the test failed,
               // else, the test succeeded.
               // ..................................................
               if ( TEST_MODE ) {
                 if ( parseInt(article.id, 10) === _test.setArticle.articleId ) {
                   if ( _test.setArticle.disruptionsIndex < _test.setArticle.howManyDisruptions ) {
                     console.log('')
                     console.log(`TEST : Make pertubation for article #${article.id}`)
                     _test.redis.set( `ART:${article.id}`, JSON.stringify({test:"failed"}) )
                     _test.setArticle.disruptionsIndex++
                   }
                 }
               }
               // --------------------------------------------------
 
               const pipeline = _redis.multi( )
               pipeline.set( `ART:${article.id}`, JSON.stringify(article) )
               pipeline.exec( (err, result) => {
                 if ( err ) {
                   reject( err )
                 } else {
                   if ( result === null ) {
                     console.log(`Retry to set article #${article.id}`)
                     // return _this.setArticle( article ) // Retries
                     tryToSetArticle( article ) // retry
                     .then( () => {
                       resolve( )
                     })
                     .catch( err => {
                       reject( err )
                     })
                   }
                   resolve()
                 }
               })
             })
           }
 
           // create the ID of the article, if it is new
           // and returns a Promise object
           _.has(article, 'id') && !isNaN(parseInt(article.id)) ? 
             Promise.resolve(article.id) : // already has an id (ie, an existing article)
             _redis.incr('NEXT_ID')        // has no id (ie, a new article)       
 
           .then( id => {
             article.id = id
             // Ensures the .wfs array property is sorted,
             // using the ordering local filters for the article language.
             article.wfs = _.sortedUniqBy(article.wfs, wf => {
               return _this.filterWord(
                 wf, 
                 _this.localFilters(article.lang).orderingFilters
               )
             })
 
             tryToSetArticle( article )
             .then( () => {
               // console.log(`2 : article ${article.id} created`)
 
               _this.setArticleIndices( article, _this.localFilters(article.lang) )
               .then( () => {
                 // console.log(`5 : indices created for article ${article.id}`)          })
                 resolve()
               })
               .catch( err => {
                 throw err
               })
             })
             .catch( err => {
               throw err
             })   
           })
         })
       }
     }
   })
 
   /**
    * setArticleIndices( article, {searchingFilters, orderingFilters} )
    * 
    * Inserts/updates the article indices (asynchronously, with Promise).
    *
    * In fact, this method will create as many entries as there
    * are characters in each written form of the article.
    * For example, for a written form of the Guadeloupean creole
    * word "abò", this method will insert/update the following 
    * entries (in searching format) :
    * 
    * • "IDX:gp:a"
    * • "IDX:gp:ab"
    * • "IDX:gp:abo"
    *  
    * Each of these keys has a JSON array of objects, as value, 
    * with the following JSON object appended to it (assuming
    * each written form appears only once in the "wfs" 
    * article's property) :
    *
    * { id:<article ID>, wfs:["abò", ...] }
    * 
    * @param {object} article The article object.
    * @param {object} filters An object containing two properties,
    *                         "searchingFilters" and "orderingFilters",
    *                         each of which containing a filters object
    *                         that can be passed to the Wabap.filterWord()
    *                         method.
    * @returns {Promise}      Promise object.
    */
   Object.defineProperty( _this, 'setArticleIndices', {
     get: function() {
       return function( article, {searchingFilters, orderingFilters} ) {   // Async with Promise
 
         return new Promise( (resolve, reject) => {
           const articleRef = {
             id: article.id,
             wfs: article.wfs
           }
           let wfsIndex = 0
           let sfIndex = 0
           let sfPrefix = ''
           let wf = ''
           let sf = ''
 
           let processIndex = function( sfPrefix ) {
             return new Promise( (resolve, reject) => {
               let found = false
 
               // Gets the article references from Redis
               const key = `IDX:${article.lang}:${sfPrefix}`
 
               _redis.watch(key)
 
               _redis.get(key)
               .then( res => {
                 let artRefs = JSON.parse(res)
 
                 // console.log(`3 : article ${article.id} : at "${key}" found ${(artRefs || []).length} items`)
                 if ( ! (_.isNull(artRefs) || _.isArray(artRefs)) ) {
                   reject( `Invalid value for key "${key}" (="${JSON.stringify(artRefs)}")` )
                 }
 
                 if ( artRefs ) {
                   for (let artRef of artRefs) {
                     if (articleRef.id === artRef.id) {
                       // Merges the wfs that belong to the same article
                       found = true
                       artRef.wfs = _.sortedUniqBy(
                         _.concat(artRef.wfs, articleRef.wfs),
                         wf => _this.filterWord(wf, orderingFilters)
                       )
                       break // exit the for loop
                     }
                   }
                 }
 
                 if ( ! found ) {
                   // Inserts articleRef in the artRefs array.
 
                   // Ensures artRefs is an array, first.
                   if ( _.isNull(artRefs) ) artRefs = []
 
                   // Gets the index to insert articleRef at,
                   // in order to keep the artRefs array sorted.
                   const insertionIndex = _.sortedIndexBy( artRefs, articleRef, (artRef) => {
                     // sorted by comparing a special searching form
                     // (ie, without hyphen "-", space " ", ...) of the
                     // first written form
                     return _this.filterWord( artRef.wfs[0], orderingFilters)
                   })
 
                   // Inserts articleRef at insertionIndex, in artRefs.
                   artRefs.splice(insertionIndex, 0, articleRef)
                 }
 
                 const pipeline = _redis.multi()
                 pipeline.set( key, JSON.stringify(artRefs) )
                 pipeline.exec( function(err, results) {
                   if ( err || results === null ) {
                     // console.log( `article ${article.id} : Retry to set indices of article #${article.id}` )
                     processIndex.call( _this, sfPrefix ) // Retries
                     .then( () => {
                       resolve()
                     })
                     .catch( (err) => {
                       reject( err )
                     })
                     return                
                   }
                   // console.log(`4 : article ${article.id} : at "${key}" set ${(artRefs || []).length} items`)
                   resolve()
                 })
 
               })
             })
             .catch( err => {
               reject( err )
             })
           }
 
           let processNextIndex = function( ) {
             return new Promise( (resolve, reject) => {
               if ( wfsIndex === article.wfs.length ) {
                 // no more indices to process
                 resolve()
                 return
               }
 
               wf = article.wfs[wfsIndex]
               sf = _this.filterWord(wf, searchingFilters) // get searhing form
               sfPrefix += sf.charAt(sfIndex)
               sfIndex++
 
               processIndex( sfPrefix )
               .then( () => {
 
                 if ( sfIndex === sf.length ) {
                   // reached the end of sf
                   wfsIndex++    // next wf
                   sfIndex = 0   // reset the sf index
                   sfPrefix = ''
                 }
 
                 processNextIndex( )
                 .then( () => {
                   resolve( )
                 })
                 .catch( err => {
                   reject( err )
                 })
               })
               .catch( err => {
                 reject( err )
               })
 
             })
           }
 
           processNextIndex( )
           .then( () => {
             resolve( )
           })
           .catch( err => {
             reject( err )
           })
         })
 
       }
     }
   })
  
   /**
    * suggestArticles( {language='gp', word, part=0}={} )
    *
    * Returns asynchronously an object like the following one :
    * 
    * {
    *   count: 23,
    *   sample: [
    *     { id:42, wfs:["aboli"] },
    *     { id:44, wfs:["aboutsouf", ...] },
    *     ...
    *   ]
    * }
    *
    * Where "count" is the number of the all matching article indices
    * (not only those returned in the sample), "sample" is a portion
    * of the article indices (up to 10), "id" is an article ID
    * and the "wfs" items are the written words for this article.
    * 
    * @param  {object}   word:     The word prefix for the articles to fetch.
    *                    language: The language of the word.
    *                    part:     The portion 0-based index of article indices, grouped by 10. 
    *                    
    * @return {Promise}            The promise, with the indices array on resolve.
    */
   Object.defineProperty( _this, 'suggestArticles', {
     get: function( ) {
       return function( {language='gp', word, part=0}={}  ) {
         return new Promise( (resolve, reject) => {
 
           part = parseInt(part, 10) // ensures we have an integer
 
           if ( ! (_.isInteger(part) && part >= 0) ) {
             reject( new Error('Invalid article indices part index.'))
           }
 
           const lang = language
           const sf = _this.filterWord( word, 
             _this.localFilters(language).searchingFilters
           )
 
           if ( typeof sf === 'undefined' ) {
             resolve( [] )
           } else {
             _redis.get( `IDX:${language}:${sf}` )
             .then( result => {
               let indices = JSON.parse(result) || []
 
               // keeps only the words of the wfs array
               // that starts with the specified word.
               for (let index of indices) {
                 let filteredWfs = _.filter(index.wfs, (val, i, wfs) => _.startsWith(
                   _this.filterWord( val, _this.localFilters(language).searchingFilters ),
                   _this.filterWord( word, _this.localFilters(language).searchingFilters )
                 ))
                 index.wfs = _.uniq(filteredWfs)
               }
 
               // groups the indices that have the exact
               // same content of their wfs arrays in an object
               // containing two properties :
               // - ids : an array of index id ;
               // - wfs : the wfs array that is the same between
               // the those indices.
               let groupIndices = []
               let groupIndicesCount
               let groupIndexFound
 
               for(let index of indices) {
                 groupIndexFound = false
                 for(let groupIndex of groupIndices) {
                   if (index.wfs[0] === groupIndex.wfs[0]) {
                     groupIndex.ids.push(index.id)
                     groupIndexFound = true
                     break
                   }
                 }
                 if (!groupIndexFound) {
                   groupIndices.push({
                     ids: [index.id],
                     wfs: _.merge([], index.wfs)
                   })
                 }
               }
 
               // sorts the indices in the alphabetical
               // order of their first wfs array item.
               groupIndices = _.sortBy( groupIndices, groupIndex => 
                 _this.filterWord( groupIndex.wfs[0], _this.localFilters(language).orderingFilters) )
               groupIndicesCount = groupIndices.length
 
               // keeps only the portion of article indices that match the 'part' index
               groupIndices = _.slice( groupIndices, part*10, (part+1)*10-1 )
 
               // returns the indices
               resolve({
                 count: groupIndicesCount,
                 sample: groupIndices || []
               })
             })
             .catch( err => {
               reject( err )
             })
           }
         })
       }
     }
   })
 
   /**
    * getArticle( id )
    *
    * Fetches the article identified by its ID.
    * 
    * @param  {string}   id            the article ID.
    * @return {Promise}                a Promise object.
    */
   Object.defineProperty( _this, 'getArticle', {
     get: function() {
       return function( id ) {
         return new Promise( (resolve, reject) => {
           _redis.get(`ART:${id}`)
           .then( article => {
             resolve( article ) // returns the article or null
           })
           .catch( err => {
             reject( err )
           })
         })
       }
     }
   })
         
     
   // Checks the options argument (must be an object or undefined)
   if ( typeof options !== 'object' && typeof options !== 'undefined' )
       throw 'Invalid options argument (must be an object or undefined)';
   
   // Initializes filters from the options argument
   if ( typeof options === 'object' ) {
 
     _dbCon = options.dbConnection
     _redis = new Redis(_dbCon)
 
     if ( TEST_MODE ) {
       _test.redis = new Redis(_dbCon) // Tests purposes only
     }
   }
 
   Object.preventExtensions( _this ) // Avoids the creation of new properties right now
   
   return _this
 }
 
 