import React, { Component } from 'react';

//import './includes.js'



// <script type=text/javascript src="{{url_for('static', filename='musat_options.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_run_on_server.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='global.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_allele_calls.js') }}"></script>

// <script type=text/javascript src="{{url_for('static', filename='musat_grid_locus.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_grid_controls.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_process_graph_data.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_grid_graph.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_draw_grid.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_main.js') }}"></script>

// <script type=text/javascript src="{{url_for('static', filename='musat_graphing.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_results.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_utils.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_save_server.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_stats.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_progress_display.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='step_1_set_directory.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='step_2_sample_names.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='step_3_trim_adapters.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='step_4_merge_reads.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='step_5_locus_files.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_explore_bars.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_explore_scatter.js') }}"></script>
// <script type=text/javascript src="{{url_for('static', filename='musat_explore.js') }}"></script>


// <script type=text/javascript src="{{url_for('static', filename='musat_flow.js') }}"></script>


const {app} = window.require('electron').remote;

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>React + Electron = <span role="img" aria-label="love">😍</span></h2>
        </div>
        <p className="App-intro">
          <b> Release 0.2.7 </b>
          Version: {app.getVersion()}
        </p>
      </div>
    );
  }
}

export default App;
