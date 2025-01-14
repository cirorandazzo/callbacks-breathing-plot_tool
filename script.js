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
        // Function to populate filters with unique values
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
            const putativeCallFilter = document.getElementById('putativeCallFilter').value;
            const blockFilter = document.getElementById('blockFilter').value;
            const wavFilenameFilter = document.getElementById('wavFilenameFilter').value.toLowerCase();
            const plotIDFilter = document.getElementById('plotIDFilter').value.toLowerCase();
    
            // Filter the data
            const filteredData = jsonData.filter(item => {
                const matchesBird = birdFilter ? item.bird === birdFilter : true;
                const matchesStimPhase = stimPhaseFilter ? item.stim_phase === stimPhaseFilter : true;
                const matchesPutativeCall = putativeCallFilter ? String(item.putative_call) === String(putativeCallFilter) : true;
                const matchesBlock = blockFilter ? String(item.block) === blockFilter : true;
                const matchesWavFilename = wavFilenameFilter ? item.wav_filename.toLowerCase().includes(wavFilenameFilter) : true;
                const matchesPlotID = plotIDFilter ? item.plot_id.toLowerCase().includes(plotIDFilter) : true;
    
                return matchesBird && matchesStimPhase && matchesPutativeCall && matchesBlock && matchesWavFilename && matchesPlotID;
            });
    
            // Update the table with filtered data
            updateTable(filteredData);
        }
    
        // Function to update the table with filtered data
        function updateTable(data) {
            const tableBody = document.querySelector('#dataTable tbody');
            tableBody.innerHTML = ''; // Clear existing rows
    
            // Get the selected plot types
            const plotKeys = Array.from(document.getElementById('plotKeySelector').selectedOptions).map(option => option.value);
    
            // Dynamically add or remove columns based on selected plot types
            addColumns(plotKeys);
    
            data.forEach(item => {
                const row = document.createElement('tr');
    
                // Add non-plot columns
                row.innerHTML = `
                    <td>${item.bird}</td>
                    <td>${item.stim_phase}</td>
                    <td>${item.putative_call}</td>
                    <td>${item.block}</td>
                `;
    
                // Add the plot images for each selected plot type
                plotKeys.forEach(plotKey => {
                    const imageCell = document.createElement('td');
                    const image = document.createElement('img');
    
                    if (item.plot_filename && item.plot_filename[plotKey]) {
                        image.src = item.plot_filename[plotKey]; // Get image path from JSON based on the selected key
                        image.alt = `${item.plot_id} - ${plotKey}`;
                        image.style.width = "400px"; // Optional styling for the image size
                        image.style.height = "auto";
                    } else {
                        image.src = ''; // Set to an empty string if the key doesn't exist
                        image.alt = 'No plot available';
                    }
                    imageCell.appendChild(image);
                    row.appendChild(imageCell);
                });
    
                // Add plot ID and wav filename columns
                row.innerHTML += `
                    <td>${item.plot_id}</td>
                    <td>${item.wav_filename}</td>
                `;
                tableBody.appendChild(row);
            });
    
            // Update trial count
            document.getElementById('dataTable-label').innerHTML = String(data.length) + ' trials found.';
        }
    
        // Function to dynamically add or remove columns based on selected plot types
        function addColumns(plotKeys) {
            const tableHeader = document.querySelector('#dataTable thead tr');
            const tableBody = document.querySelector('#dataTable tbody');
    
            // Remove existing plot columns from the header and rows
            while (tableHeader.children.length > 4) {
                tableHeader.deleteCell(4); // Remove plot columns
            }
    
            // Remove plot columns from the body rows
            tableBody.querySelectorAll('tr').forEach(row => {
                while (row.cells.length > 7) {
                    row.deleteCell(4); // Remove plot cells
                }
            });
    
            // Add new plot columns in the header
            plotKeys.forEach(plotKey => {
                const newHeaderCell = document.createElement('th');
                newHeaderCell.textContent = plotKey.charAt(0).toUpperCase() + plotKey.slice(1);
                tableHeader.appendChild(newHeaderCell);
            });
    
            // Add headers for Plot ID and Wav Filename at the end (if not already present)
            if (tableHeader.children.length <= 6) {
                tableHeader.innerHTML += `
                    <th>Plot ID</th>
                    <th>Wav Filename</th>
                `;
            }
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
        document.getElementById('plotIDFilter').addEventListener('change', applyFilters);
    
        // Event listener for plot type selection
        document.getElementById('plotKeySelector').addEventListener('change', function() {
            applyFilters(); // Reapply filters and update the table when plot types change
        });
    }
       

    loadData();
});