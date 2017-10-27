module BABYLON {
    /**
     * This class can be used to get instrumentation data from a Babylon engine
     */
    export class EngineInstrumentation implements IDisposable {
        private _captureGPUFrameTime = false;
        private _gpuFrameTimeToken: Nullable<_TimeToken>;
        private _gpuFrameTime = new PerfCounter();

        private _captureShaderCompilationTime = false;
        private _shaderCompilationTime = new PerfCounter();        

        // Observers
        private _onBeginFrameObserver: Nullable<Observer<Engine>> = null;
        private _onEndFrameObserver: Nullable<Observer<Engine>> = null;
        private _onBeforeShaderCompilationObserver: Nullable<Observer<Engine>> = null;
        private _onAfterShaderCompilationObserver: Nullable<Observer<Engine>> = null;

        // Properties
        /**
         * Get the perf counter used for GPU frame time
         */
        public get gpuFrameTimeCounter(): PerfCounter {
            return this._gpuFrameTime;
        }

        /**
         * Get the current GPU frame time (in nanoseconds)
         */
        public get currentGPUFrameTime(): number {
            return this._gpuFrameTime.current;
        }

        /**
         * Get the average GPU frame time (in nanoseconds)
         */        
        public get averageGPUFrameTime(): number {
            return this._gpuFrameTime.average;
        }

        /**
         * Gets the current GPU frame time capture status
         */
        public get captureGPUFrameTime(): boolean {
            return this._captureGPUFrameTime;
        }

        /**
         * Enable or disable the GPU frame time capture
         */        
        public set captureGPUFrameTime(value: boolean) {
            if (value === this._captureGPUFrameTime) {
                return;
            }

            if (value) {
                this._onBeginFrameObserver = this.engine.onBeginFrameObservable.add(()=>{
                    if (!this._gpuFrameTimeToken) {
                        this._gpuFrameTimeToken = this.engine.startTimeQuery();
                    }
                });

                this._onEndFrameObserver = this.engine.onEndFrameObservable.add(()=>{
                    if (!this._gpuFrameTimeToken) {
                        return;
                    }
                    let time = this.engine.endTimeQuery(this._gpuFrameTimeToken);

                    if (time > -1) {
                        this._gpuFrameTimeToken = null;
                        this._gpuFrameTime.fetchNewFrame();
                        this._gpuFrameTime.addCount(time, true);
                    }
                });
            } else {
                this.engine.onBeginFrameObservable.remove(this._onBeginFrameObserver);
                this._onBeginFrameObserver = null;
                this.engine.onEndFrameObservable.remove(this._onEndFrameObserver);
                this._onEndFrameObserver = null;
            }
        }

        /**
         * Get the perf counter used for shader compilation time
         */
        public get shaderCompilationTimeCounter(): PerfCounter {
            return this._shaderCompilationTime;
        }

        /**
         * Get the current shader compilation time (in milliseconds)
         */
        public get currentShaderCompilationTime(): number {
            return this._shaderCompilationTime.current;
        }

        /**
         * Get the average shader compilation time (in milliseconds)
         */        
        public get averageShaderCompilationTime(): number {
            return this._shaderCompilationTime.average;
        }

        /**
         * Get the total shader compilation time (in milliseconds)
         */        
        public get totalShaderCompilationTime(): number {
            return this._shaderCompilationTime.total;
        }               

        /**
         * Get the number of compiled shaders
         */        
        public get compiledShadersCount(): number {
            return this._shaderCompilationTime.count;
        }  

        /**
         * Gets the perf counter associated with shader compilation
         */
        public get captureShaderCompilationTime(): boolean {
            return this._captureShaderCompilationTime;
        }

        /**
         * Enable or disable the shader compilation time capture
         */        
        public set captureShaderCompilationTime(value: boolean) {
            if (value === this._captureShaderCompilationTime) {
                return;
            }

            if (value) {
                this._onBeforeShaderCompilationObserver = this.engine.onBeforeShaderCompilationObservable.add(()=>{
                    this._shaderCompilationTime.fetchNewFrame();
                    this._shaderCompilationTime.beginMonitoring();                    
                });

                this._onAfterShaderCompilationObserver = this.engine.onAfterShaderCompilationObservable.add(()=>{
                    this._shaderCompilationTime.endMonitoring();       
                });
            } else {
                this.engine.onBeforeShaderCompilationObservable.remove(this._onBeforeShaderCompilationObserver);
                this._onBeforeShaderCompilationObserver = null;
                this.engine.onAfterShaderCompilationObservable.remove(this._onAfterShaderCompilationObserver);
                this._onAfterShaderCompilationObserver = null;
            }
        }

        public constructor(public engine: Engine) {

        }

        public dispose() {
            if (this._onBeginFrameObserver) {
                this.engine.onBeginFrameObservable.remove(this._onBeginFrameObserver);
                this._onBeginFrameObserver = null;
            }

            if (this._onEndFrameObserver) {
                this.engine.onEndFrameObservable.remove(this._onEndFrameObserver);
                this._onEndFrameObserver = null;
            }

            if (this._onBeforeShaderCompilationObserver) {
                this.engine.onBeforeShaderCompilationObservable.remove(this._onBeforeShaderCompilationObserver);
                this._onBeforeShaderCompilationObserver = null;
            }

            if (this._onAfterShaderCompilationObserver) {
                this.engine.onAfterShaderCompilationObservable.remove(this._onAfterShaderCompilationObserver);
                this._onAfterShaderCompilationObserver = null;     
            }       

            (<any>this.engine) = null;
        }
    }
}