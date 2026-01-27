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

// Tiny wrapper for DOM queries. Dom node variables has $prefix
var $ = (s, p = document) => { return p.querySelector(s) },
	$$ = (s, p = document) => { return p.querySelectorAll(s) },
	browser = chrome || browser

async function initPopup() {

	const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
	const isPorkbunSearch = tab.url.startsWith('https://porkbun.com/checkout/search')

	const $filterForm = $('#filter-form')
	const $searchPrompt = $('#search-prompt')

	if (isPorkbunSearch) {

		$filterForm.style.display = 'block'
		$searchPrompt.style.display = 'none'

		const $maxPurchasePriceInput = $('#max-purchase-price')
		const $maxRenewalPriceInput = $('#max-price')
		const savedPurchasePrice = localStorage['porkbun-max-purchase-price']
		const savedRenewalPrice = localStorage['porkbun-max-renewal-price']
		if (savedPurchasePrice !== null) $maxPurchasePriceInput.value = savedPurchasePrice
		if (savedRenewalPrice !== null) $maxRenewalPriceInput.value = savedRenewalPrice

		$filterForm.addEventListener('submit', async (e) => {
			e.preventDefault()
			const purchasePrice = $maxPurchasePriceInput.value
			const renewalPrice = $maxRenewalPriceInput.value

			localStorage['porkbun-max-purchase-price'] = purchasePrice
			localStorage['porkbun-max-renewal-price'] = renewalPrice

			await browser.scripting.executeScript({
				target: { tabId: tab.id },
				world: 'MAIN',
				func: (purchase, renewal) => {
					window.PORKBUN_CONFIG = {
						purchase: parseFloat(purchase),
						renewal: parseFloat(renewal)
					}
				},
				args: [purchasePrice, renewalPrice]
			})

			await browser.scripting.executeScript({
				target: { tabId: tab.id },
				world: 'MAIN',
				files: ['/filter.js']
			})

			window.close()
		})

	} else { // !isPorkbunSearch

		$filterForm.style.display = 'none'
		$searchPrompt.style.display = 'flex'

		const $searchForm = $('#search-form')
		const $searchInput = $('#search-input')

		if ($searchForm) {
			$searchForm.addEventListener('submit', (e) => {
				e.preventDefault()
				const query = $searchInput.value
				browser.tabs.create({ url: `https://porkbun.com/checkout/search?q=${encodeURIComponent(query)}` })
				window.close()
			})
		}

	}
}

document.addEventListener('DOMContentLoaded', initPopup)
