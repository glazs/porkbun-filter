/**
 * Porkbun Search Price Filter
 * Copyright (C) 2026 Eugene Glazyrin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

function extractPrice($node) {
    if ($node[0]) {
        const priceText = $node.text().replace(/,/g, '')
        const priceMatch = priceText.match(/\$(\d+(?:\.\d+)?)/)
        if (priceMatch) return parseFloat(priceMatch[1])
    }
    return null
}

; (() => {
    const config = window.PORKBUN_CONFIG

    $('.searchResultRow').each(function () {
        const $row = $(this.parentNode)

        const purchasePrice = extractPrice($row.find('.searchResultRowPrice'))
        const renewalPrice = extractPrice($row.find('.renewsAtContainer'))

        const shouldHide = purchasePrice > config.purchase || renewalPrice > config.renewal || (purchasePrice === null && renewalPrice === null)

        $row[shouldHide ? 'hide' : 'show']()
    })

})()