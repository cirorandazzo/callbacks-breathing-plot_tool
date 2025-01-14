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
    
            // Get the selected plot key
            const plotKey = document.getElementById('plotKeySelector').value;
    
            data.forEach(item => {
                const row = document.createElement('tr');
    
                // Create image elements for the selected plot type
                const imageCell = document.createElement('td');
                const image = document.createElement('img');
    
                // Check if the selected plot type exists in the current item
                if (item.plot_filename && item.plot_filename[plotKey]) {
                    image.src = item.plot_filename[plotKey]; // Get image path from JSON based on the selected key
                    image.alt = `${item.plot_id} - ${plotKey}`;
                    image.style.width = "800px"; // Optional styling for the image size
                    image.style.height = "auto";
                } else {
                    image.src = ''; // Set to an empty string if the key doesn't exist
                    image.alt = 'No plot available';
                }
                imageCell.appendChild(image);
    
                // Construct row with other details
                row.innerHTML = `
                    <td>${item.bird}</td>
                    <td>${item.stim_phase}</td>
                    <td>${item.putative_call}</td>
                    <td>${item.block}</td>
                `;
    
                // Add the plot image and other info
                row.appendChild(imageCell);
                row.innerHTML += `
                    <td>${item.plot_id}</td>
                    <td>${item.wav_filename}</td>
                `;
                tableBody.appendChild(row);
            });
    
            // Update trial count
            document.getElementById('dataTable-label').innerHTML = String(data.length) + ' trials found.';
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
    
        // Event listener for plot type change
        document.getElementById('plotKeySelector').addEventListener('change', function() {
            applyFilters(); // Reapply filters to update the table with the new plot type
        });
    }

    loadData();
});