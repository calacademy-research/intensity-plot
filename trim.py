import run_server
import sys
import options

# return a valid get response.
def trim(directory):
    # if arg_string is None:
    arg_string = get_trim_invocation(directory)
    print("Trim module with args: " +arg_string)
    # args = arg_string.split()
    #
    # directory = args.pop(0)
    # # pwd = os.path.dirname(os.path.realpath(__file__))
    # adapter_file = args.pop(0)
    # if not os.path.isdir(directory):
    #     return 'No such directory: ' + directory, 404
    # if not os.path.isfile(adapter_file):
    #     err_string = 'No such file: ' + adapter_file
    #     sys.stdout.write(err_string)
    #     return err_string, 404
    #           # Note need to add

        # TruSeq3-PE-2.fa PE
        # FullSampleRun_R1.fq
        # FullSampleRun_R2.fq FullSampleRun_trim_R1.fq R1_sngl.fq
        # FullSampleRun_trim_R2.fq R2_sngl.fq
        # ILLUMINACLIP: <needs path here> TruSeq3-PE-2.fa:2:30:10
    trim_pgm = get_trim_program(directory)  # subprocess.check_output(['./bin/check_dependency.sh','trimmomatic'])
    call_string = trim_pgm + ' ' + arg_string
    sys.stdout.write("trim cmd: " + call_string)

    return run_server.run_process(call_string.split(' '),
                                   directory,
                                   True), 200

def get_trim_program(directory):
    trimmomatic_jar = options.get_dependency_path('trimmomatic_jar_path', directory)
    java_path =  options.get_dependency_path('java_bin_path', directory)
    command = java_path + " -jar " + trimmomatic_jar
    return command

def get_trim_invocation(directory):
    # + "<pre class='indent'> <code id='trim_dfl_cmd'>PE "+R1+ " " +R2+ " " +R1_trim+ " " +R1_sngl+
# " " +R2_trim+ " " +R2_sngl+ " \\<br/>"
    # + "                ILLUMINACLIP:<span id='clipdir'>&nbsp;</span><span id='clipfile'>TruSeq3-PE-2.fa</span>:2:30:10</code>"
    args = "PE "
    args += options.get_program_argument("R1", directory)
    args += " "
    args += options.get_program_argument("R2", directory)
    args += " "
    args += options.get_program_argument("R1_trim", directory)
    args += " "
    args += options.get_program_argument("R1_single", directory)
    args += " "
    args += options.get_program_argument("R2_trim", directory)
    args += " "
    args += options.get_program_argument("R2_single", directory)
    args += " "
    args += "ILLUMINACLIP:"
    args += options.get_dependency_path("trimmomatic_adapters_path", directory)
    args += "/"
    args += options.get_program_argument("trimmomatic_adapter_file", directory)
    args += options.get_program_argument("trimmomatic_suffix", directory)
    return args







