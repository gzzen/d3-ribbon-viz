/**
 * Loads a CSV file using d3.csv() and attaches a sampleID to each row.
 * The original CSV is not modified.
 *
 * @param {string} csvPath - path to the CSV file
 * @param {Object} options
 * @param {string}  [options.idColumn]   - name of an existing column to use as unique identifier
 * @param {boolean} [options.generateId] - if true, assign a synthetic 0-based numeric ID
 * @returns {Promise<Object[]>} array of row objects, each with a sampleID field added
 */
export async function loadCSV(csvPath, { idColumn = null, generateId = false } = {}) {
	if (!idColumn && !generateId) {
		throw new Error('Specify either idColumn or generateId: true');
	}

	const rows = await d3.csv(csvPath);

	if (idColumn && rows.length > 0 && !(idColumn in rows[0])) {
		throw new Error(`idColumn "${idColumn}" not found in CSV`);
	}

	return rows.map((row, i) => ({
		sampleID: generateId ? String(i) : String(row[idColumn]),
		...row,
	}));
}
