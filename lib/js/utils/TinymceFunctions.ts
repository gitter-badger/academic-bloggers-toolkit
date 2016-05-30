declare var ABT_meta;


/**
 * Opens `reference-window.tsx` and returns a promise which resolves to either
 *   `ABT.ReferencePayload` or `null` on close.
 * @param editor   The active TinyMCE instance.
 * @return A Promise which resolves to ABT.ReferenceWindowPayload
 */
export function referenceWindow(editor: TinyMCE.Editor): Promise<ABT.ReferenceWindowPayload> {
    return new Promise((resolve, reject) => {
        editor.windowManager.open({
            title: 'Insert Formatted Reference',
            url: ABT_meta.tinymceViewsURL + 'reference-window.html',
            width: 600,
            height: 10,
            params: {
                baseUrl: ABT_meta.tinymceViewsURL,
            },
            onclose: (e) => {
                if (!e.target.params.data) resolve(null);
                resolve(e.target.params.data as ABT.ReferenceWindowPayload);
            },
        });
    });
};


/**
 * Opens `import-window.tsx` and returns a promise which resolves to
 *   `ABT.ImportWindowPayload` or `null` on close
 * @param  editor The active TinyMCE instance.
 * @return A Promise which resolves to ABT.ImportWindowPayload
 */
export function importWindow(editor: TinyMCE.Editor): Promise<ABT.ImportWindowPayload> {
    return new Promise((resolve, reject) => {
        editor.windowManager.open({
            title: 'Import References from RIS File',
            url: ABT_meta.tinymceViewsURL + 'import-window.html',
            width: 600,
            height: 10,
            onclose: (e) => {
                if (!e.target.params.data) resolve(null);
                resolve(e.target.params.data as ABT.ImportWindowPayload);
            },
        });
    });
}


interface CitationPositions {
    /** The index of the HTMLSpanElement being inserted */
    currentIndex: number;
    locations: [Citeproc.CitationsPrePost, Citeproc.CitationsPrePost];
}
/**
 * Iterates the active TinyMCE instance and obtains the citations that come both
 *   before and after the inline citation being inserted currently. Also receives
 *   the index of the current citation within the document (ie, if there's one
 *   citation before and one citation after the current citation, `currentIndex`
 *   will be 1).
 * @param editor The active TinyMCE instance.
 * @return Parsed citation data.
 */
export function getRelativeCitationPositions(editor: TinyMCE.Editor): CitationPositions {
    const selection = editor.selection;
    const doc: Document = editor.dom.doc;

    const cursor = editor.dom.create('span', { id: 'CURSOR', class: 'abt-cite'});
    selection.getNode().appendChild(cursor);

    const citations = doc.getElementsByClassName('abt-cite');
    const payload: CitationPositions = {
        currentIndex: 0,
        locations: [[], []],
    };

    if (citations.length > 1) {
        let key = 0;
        Array.from(citations).forEach((el, i) => {
            if (el.id === 'CURSOR') {
                key = 1;
                payload.currentIndex = i;
                return;
            }
            payload.locations[key].push([el.id, i - key]);
        });
    }
    let el = editor.dom.doc.getElementById('CURSOR');
    el.parentElement.removeChild(el);
    return payload;
}

/**
 * Updates the editor with inline citation data (citation clusters) generated
 *   by the processor.
 *
 * @param  editor   Active TinyMCE editor.
 * @param  clusters Citeproc.CitationClusterData[] generated by the processor.
 * @param  citationByIndex CitationByIndex data used to generate data attributes.
 * @param  xclass   Type of citation (full-note style or in-text style).
 * @return Promise which acts as a semaphore for the bibliography parser.
 */
export function parseInlineCitations(
    editor: TinyMCE.Editor,
    clusters: Citeproc.CitationClusterData[],
    citationByIndex: Citeproc.CitationByIndex,
    xclass: 'in-text'|'note'
): Promise<boolean> {

    return new Promise(resolve => {
        const doc = editor.dom.doc;
        const exisingNote = doc.getElementById('abt-footnote');


        for (const [i, item] of clusters.entries()) {
            const inlineText = xclass === 'note' ? `[${item[0] + 1}]` : item[1];
            const citation: HTMLSpanElement = editor.dom.doc.getElementById(item[2]);
            const sortedItems: Citeproc.SortedItems = citationByIndex[item[0]].sortedItems;
            const idList: string = JSON.stringify(sortedItems.map(c => c[1].id));
            if (!citation) {
                editor.insertContent(
                    `<span id='${item[2]}' data-reflist='${idList}' class='abt-cite noselect mceNonEditable'>${inlineText}</span>`
                );
                continue;
            }
            citation.innerHTML = inlineText;
            citation.dataset['reflist'] = idList;
        }

        if (exisingNote) exisingNote.parentElement.removeChild(exisingNote);

        if (xclass === 'note') {

            const note = doc.createElement('DIV');
            note.id = 'abt-footnote';
            note.className = 'noselect mceNonEditable';

            const heading = doc.createElement('DIV');
            heading.className = 'abt-footnote-heading';
            heading.innerText = 'Footnotes';
            note.appendChild(heading);

            for (const [i, item] of clusters.entries()) {
                const div = doc.createElement('DIV');
                div.className = 'abt-footnote-item';
                div.innerHTML = `<span class="note-number">[${i + 1}]</span><span class="note-item">${item[1]}</span>`;
                note.appendChild(div);
            }

            const bib = doc.getElementById('abt-smart-bib');

            // Save a reference to the current cursor location
            const selection = editor.selection;
            const cursor = editor.dom.create('span', { id: 'CURSOR', class: 'abt-cite'});
            selection.getNode().appendChild(cursor);

            // Do work
            if (bib) bib.parentNode.removeChild(bib);

            editor.setContent(editor.getContent() + note.outerHTML);

            // Move cursor back to where it was & delete reference
            const el = doc.getElementById('CURSOR');
            if (el) {
                editor.selection.select(el, true);
                editor.selection.collapse(true);
                el.parentElement.removeChild(el);
            }
        }
        resolve(true);
    });
}

/**
 * Replaces the current bibliography, or creates a new one if one doesn't exist
 * @param editor       Active TinyMCE editor.
 * @param bibliography Bibliography array.
 * @param options      Bibliography options
 */
export function setBibliography(
    editor: TinyMCE.Editor,
    bibliography: {id: string, html: string}[],
    options: {heading: string, style: 'fixed'|'toggle'}
): void {
    const doc = editor.dom.doc;
    const existingBib = doc.getElementById('abt-smart-bib');
    const bib = doc.createElement('DIV');
    bib.id = 'abt-smart-bib';
    bib.className = 'noselect mceNonEditable';

    if (options.heading) {
        const heading = doc.createElement('H3');
        heading.innerText = options.heading;
        if (options.style === 'toggle') heading.className = 'toggle';
        bib.appendChild(heading);
    }

    for (const meta of bibliography) {
        const item = doc.createElement('DIV');
        item.id = meta.id;
        item.innerHTML = meta.html;
        bib.appendChild(item);
    }

    const noCitationsWithHeading: boolean = bib.children.length === 1 && options.heading !== null;
    const noCitationsWithoutHeading: boolean = bib.children.length === 0;

    if (existingBib) existingBib.parentElement.removeChild(existingBib);
    if (noCitationsWithHeading || noCitationsWithoutHeading) return;

    // Save a reference to the current cursor location
    const selection = editor.selection;
    const cursor = editor.dom.create('span', { id: 'CURSOR', class: 'abt-cite'});
    selection.getNode().appendChild(cursor);

    // Do work
    editor.setContent(editor.getContent() + bib.outerHTML);

    // Move cursor back to where it was & delete reference
    const el = editor.dom.doc.getElementById('CURSOR');
    if (el) {
        editor.selection.select(el, true);
        editor.selection.collapse(true);
        el.parentElement.removeChild(el);
    }
}
