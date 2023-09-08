<template>
    <div class="nav-bar">
        <img class="logo" src="../assets/superalgos-logo-white.png" >
    </div>
</template>

<script>
export default {
    data() {
        return {}
    }
}
</script>

<style scoped>
    .nav-bar {
        position:fixed; 
        left:0;           
        top:0;            
        width:100vw;      
        z-index:200;  
        height:50spx;  
        background-image: url('../assets/superalgos-header-background.png');
        display: flex; 
    }

    .logo {
        height: 50px;
    }
</style>
