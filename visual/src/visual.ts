async function paintArray(
    svg: HTMLElement, document: Document,
    initData: Array<number>,
    insertionArray: Array<number>,
    mergeArray: Array<number>
) {

    arrayAnimator(insertionArray, 'insert', 0, 0)
    animatorMergeSort(mergeArray, 'merge', 0, 60)

    async function arrayAnimator(events, className: string, x: number, y: number) {
        for (let event of events) {
            clearClass(className);
            for (let [i, number] of Object.entries(event)) {
                let r = rect(className, x + Number(i) * 4, y, 3, number);
                svg.appendChild(r);
            }
            await sleep(50);
        }
    }
    async function animatorMergeSort(events, className: string, x: number, y: number) {
        let numebrsToRender = initData.map((x) => x);
        console.log(numebrsToRender);

        for (let [numbers, startIndex] of events) {
            let children = svg.childNodes;
            clearClass(className);

            // put current numbers into previousNumbers
            for (let i = 0; i < numbers.length; i++) {
                numebrsToRender[i + startIndex] = numbers[i];
            }
            console.log(numbers.length, startIndex, numbers, numebrsToRender);


            for (let [i, number] of Object.entries(numebrsToRender)) {
                let r = rect(className, x + Number(i) * 4, y, 3, number)
                svg.appendChild(r);
            }
            await sleep(50);
        }
    }
    function empty(ele) {
        ele.textContent = undefined;
    }
    function clearClass(name: string) {
        var paras = document.getElementsByClassName(name);
        while (paras[0]) {
            paras[0].parentNode.removeChild(paras[0]);
        }
    }
    function rect(className, x, y, width, height): SVGElementTagNameMap['rect'] {
        // https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS
        // https://stackoverflow.com/questions/12786797/draw-rectangles-dynamically-in-svg
        let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', width);
        // @ts-ignore
        rect.setAttribute('height', height);
        // @ts-ignore
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.classList.add(className);
        return rect;
    }
}

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    })
}

async function InsertionSort(array, reactor) {

    function insert(array, number) {
        // [1, 2, 4, 5], 3
        // in-place
        // immutable 不可变
        if (array.length === 0) {
            return [number];
        }
        let sorted = [];
        let inserted = false;
        for (let i = 0; i < array.length; i++) { // n
            if (!inserted) {
                if (number < array[i]) {
                    inserted = true;
                    sorted.push(number);
                }
            }
            sorted.push(array[i]);
        }
        if (!inserted) {
            sorted.push(number);
        }
        return sorted;
    }

    let sortedArray = [];
    for (let i = 0; i < array.length; i++) { // n
        sortedArray = insert(sortedArray, array[i]);
        reactor.push(sortedArray.concat(array.slice(i + 1)));
    }
    return sortedArray;
}


async function MergeSort(array, reactor) {

    function merge(l, r, startIndex) {
        if (l.length === 0) {
            return r
        }
        if (r.length === 0) {
            return l
        }
        let shifted = (() => {
            if (l[0] < r[0]) {
                return l.slice(0, 1).concat(merge(l.slice(1), r, startIndex+1))
            } else {
                return r.slice(0, 1).concat(merge(l, r.slice(1), startIndex+1))
            }
        })();
        reactor.push([shifted, startIndex]);
        return shifted;
    }

    async function sort(array, startIndex) {
        if (array.length <= 1) {
            return array;
        }
        let m = Math.floor(array.length / 2)
        let l = array.slice(0, m)
        let r = array.slice(m)
        let sortedL = await sort(l, startIndex)
        let sortedR = await sort(r, startIndex + m)
        await reactor.push([sortedL.concat(sortedR), startIndex]);
        // need global index here to correctly animate
        let merged = merge(sortedL, sortedR, startIndex)
        await reactor.push([merged, startIndex]);
        return merged;
    }
    reactor.push([array, 0]);
    return await sort(array, 0);
}

async function main() {
    let svg = document.getElementById("svg");

    // init an array
    let array = [];
    for (let i = 0; i < 50; i++) {
        array.push(Math.floor(Math.random() * 50));
    }

    // event queue
    let insertQueue = [];
    let mergeQueue = [];

    await InsertionSort(array, insertQueue);
    await MergeSort(array, mergeQueue);
    await paintArray(svg, document, array, insertQueue, mergeQueue);
}
main();