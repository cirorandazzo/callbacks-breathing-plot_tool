document.addEventListener('DOMContentLoaded', function () {
    // URL to the JSON file
    const jsonFilePath = 'data/breath_figs/plot_metadata.json';

    // Function to fetch the JSON data from the file
    async function loadData() {
        try {
            const response = await fetch(jsonFilePath);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            console.log('Data loaded!')
            console.log(jsonData); // Log the data to check the structure
            initializeFiltersAndTable(jsonData);
        } catch (error) {
            console.error('Failed to fetch JSON data:', error);
        }
    }

    // Function to populate filters and update the table with the fetched data
    function initializeFiltersAndTable(jsonData) {
        // Function to populate the filters with unique values from the JSON data
        function populateFilters() {
            const birdSelect = document.getElementById('birdFilter');
            const stimPhaseSelect = document.getElementById('stimPhaseFilter');
            const blockSelect = document.getElementById('blockFilter');
            const putativeCallSelect = document.getElementById('putativeCallFilter');

            const birds = new Set();
            const stimPhases = new Set();
            const blocks_set = new Set();
            const wavFilenames = new Set();
            const putativeCalls = new Set();

            jsonData.forEach(item => {
                birds.add(item.bird);
                stimPhases.add(item.stim_phase);
                blocks_set.add(item.block);
                wavFilenames.add(item.wav_filename);
                putativeCalls.add(item.putative_call);
            });

            let blocks = Array.from(blocks_set);
            blocks.sort();

            birds.forEach(bird => {
                const option = document.createElement('option');
                option.value = bird;
                option.textContent = bird;
                birdSelect.appendChild(option);
            });

            stimPhases.forEach(phase => {
                const option = document.createElement('option');
                option.value = phase;
                option.textContent = phase;
                stimPhaseSelect.appendChild(option);
            });

            blocks.forEach(block => {
                const option = document.createElement('option');
                option.value = block;
                option.textContent = block;
                blockSelect.appendChild(option);
            });

            putativeCalls.forEach(call => {
                const option = document.createElement('option');
                option.value = call;
                option.textContent = call;
                putativeCallSelect.appendChild(option);
            });
        }

        // Function to apply filters based on selected values
        function applyFilters() {
            const birdFilter = document.getElementById('birdFilter').value;
            const stimPhaseFilter = document.getElementById('stimPhaseFilter').value;
            const putativeCallFilter = document.getElementById('putativeCallFilter').value === 'true';
            const blockFilter = document.getElementById('blockFilter').value;
            const wavFilenameFilter = document.getElementById('wavFilenameFilter').value.toLowerCase();

            // Filter the data
            const filteredData = jsonData.filter(item => {
                // if the filter can have value == false, make sure first item of ternary operator is passed as a string (else it always returns true.)
                const matchesBird = birdFilter ? item.bird === birdFilter : true;
                const matchesStimPhase = stimPhaseFilter ? item.stim_phase === stimPhaseFilter : true;
                const matchesPutativeCall = String(putativeCallFilter) ? item.putative_call === putativeCallFilter : true;
                const matchesBlock = blockFilter ? String(item.block) === blockFilter : true;
                const matchesWavFilename = wavFilenameFilter ? item.wav_filename.toLowerCase().includes(wavFilenameFilter) : true;

                return matchesBird && matchesStimPhase && matchesPutativeCall && matchesBlock && matchesWavFilename;
            });

            // Update the table with filtered data
            updateTable(filteredData);
        }

        // Function to update the table with filtered data
        function updateTable(data) {
            const tableBody = document.querySelector('#dataTable tbody');
            tableBody.innerHTML = ''; // Clear existing rows

            data.forEach(item => {
                const row = document.createElement('tr');

                // Create an image element for the "Plot Image" column (second to last)
                const imageCell = document.createElement('td');
                const image = document.createElement('img');
                image.src = item.plot_filename; // Get image path from JSON
                image.alt = item.plot_id;
                image.style.width = "800px"; // Optional styling for the image size
                image.style.height = "auto";
                imageCell.appendChild(image);

                // console.log(item.plot_filename);

                // Construct row
                row.innerHTML = `
                    <td>${item.bird}</td>
                    <td>${item.stim_phase}</td>
                    <td>${item.putative_call}</td>
                    <td>${item.block}</td>
                `;
                row.appendChild(imageCell);
                row.innerHTML += `
                    <td>${item.wav_filename}</td>
                `;
                tableBody.appendChild(row);
            });

            // console.log('data:');
            // console.log(data.length);

            document.getElementById('dataTable-label').innerHTML = String(data.length) + ' trials found.\n';
        }

        // Initialize filters and apply them
        populateFilters();
        applyFilters();

        // Event listeners for filter changes
        document.getElementById('birdFilter').addEventListener('change', applyFilters);
        document.getElementById('stimPhaseFilter').addEventListener('change', applyFilters);
        document.getElementById('blockFilter').addEventListener('change', applyFilters);
        document.getElementById('putativeCallFilter').addEventListener('change', applyFilters);
        document.getElementById('wavFilenameFilter').addEventListener('change', applyFilters);
    }

    loadData();
});