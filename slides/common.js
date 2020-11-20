const suffixPreview = `
<!DOCTYPE html>
<meta charset="utf-8">
<title></title>

<style>
body {
  font-size: 25px;
  line-height: 1.4;
  cursor: default;
}

*, ::before, ::after {
  box-sizing: border-box;
}

button, input, select, textarea {
  font-family: inherit;
  font-size: 100%;
}
</style>
`

function flatIndent(text) {
  text = text.replace(/^ *[\r\n]+|[\r\n]+ *$/g, '')
  const indent = text.match(/^ */)[0].length
  return text.replace(new RegExp(`^ {0,${indent}}`, 'gm'), '')
}

for (const $temp of document.querySelectorAll('template.playground')) {
  const $playground = document.createElement('div')
  $playground.className = $temp.className
  $temp.replaceWith($playground)

  const $preview = document.createElement('iframe')
  $preview.className = 'preview'
  if ($temp.dataset.preview !== 'none') {
    $playground.append($preview)
  }
  if ($temp.dataset.maxHeight) {
    $playground.style.maxHeight = $temp.dataset.maxHeight
  }

  const $code = document.createElement('code')
  $code.contentEditable = true
  $code.spellcheck = false
  $playground.append($code)

  const update = () => {
    URL.revokeObjectURL($preview.src)
    const node = $temp.cloneNode(true)
    if ($temp.dataset.pick) {
      node.content.querySelector($temp.dataset.pick).innerHTML = $code.textContent
    } else {
      node.innerHTML = $code.textContent
    }
    for (const el of node.content.querySelectorAll('img')) {
      const src = el.getAttribute('src')
      if (src && !/^(https?:)?\/\//.test(src)) {
        el.src = new URL(src, location).href
      }
    }
    const html = suffixPreview + node.innerHTML
    $preview.src = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  }

  let debounceId
  const $pick = $temp.dataset.pick ? $temp.content.querySelector($temp.dataset.pick) : $temp

  $code.addEventListener('input', () => {
    clearTimeout(debounceId)
    debounceId = setTimeout(update, 500)
  })

  addEventListener('slide-init', () => {
    $code.textContent = flatIndent($pick.innerHTML)
    $preview.style.width = $temp.dataset.preview || '360px';
    update()
    $code.scrollTop = 0
    $preview.contentWindow.document.scrollingElement.scrollTop = 0
  })
}

new ResizeObserver(() => {
  document.body.style.transform = `scale(${window.innerWidth / 1500})`
}).observe(document.documentElement)
